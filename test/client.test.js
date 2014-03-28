
var assert = require("assert"),
    Put = require('put'),
    sinon = require('sinon'),
    util = require('util'),
    eventEmitter = require('events').EventEmitter,
    tcpModbusClient = require('../src/tcpClient');

describe("Modbus TCP/IP Client", function () {

  var modbusClient, tcpModbusClient, modbusHandler, socketApiDummy;

  beforeEach(function (done) {

    socketApiDummy = {
      on : function () { }
    };

    var dummy = function () { };

    modbusClient = require('../src/serialClient');
    modbusClient.setLogger(dummy);  // shut down the logger
    
    modbusHandler = require('../src/handler');
    modbusHandler.setLogger(dummy); // shut down the logger

    tcpModbusClient = require('../src/tcpClient');
    tcpModbusClient.setLogger(dummy);

    done();

  });

  afterEach(function (done) {

    var cName = require.resolve('../src/serialClient'),
        hName = require.resolve('../src/handler'),
	tName = require.resolve('../src/tcpClient');
    
    delete require.cache[cName];
    delete require.cache[hName];
 
    done();

  });

  it("should do the setup", function () {

    var socketMock = sinon.mock(socketApiDummy);

    socketMock.expects('on').once()
	.withArgs(sinon.match('connect'), sinon.match.func);

    socketMock.expects('on').once()
	.withArgs(sinon.match('data'), sinon.match.func);

    socketMock.expects('on').once()
	.withArgs(sinon.match('end'), sinon.match.func);

    socketMock.expects('on').once()
	.withArgs(sinon.match('error'), sinon.match.func);

    socketMock.expects('on').once()
	.withArgs(sinon.match('close'), sinon.match.func);


    var tcpClient = tcpModbusClient.create(socketApiDummy);
    var client = modbusClient.create(tcpClient);

    assert.ok(client);

    socketMock.verify();

  });


  describe('Socket events', function () {

    var client, tcpHeader;

    var SocketApi = function () {
      eventEmitter.call(this);

      this.write = function () { };
    };

    util.inherits(SocketApi, eventEmitter);

    /**
     *  The SocketApi's instance, gets initiated before each
     *  test.
     */
    var socket;

    beforeEach(function () {

      socket = new SocketApi();

      tcpHeader = tcpModbusClient.create(socket);

      client = modbusClient.create(
	    tcpHeader, 
	    modbusHandler.Client.ResponseHandler);

      socket.emit('connect');

    });

    it('should report events', function () {

      var endSpy    = sinon.spy(),
          errorSpy  = sinon.spy(),
	      closeSpy  = sinon.spy();

      client.on('end', endSpy);
      //client.on('error', errorSpy);
      client.on('close', closeSpy);

      socket.emit('end');
      socket.emit('error');
      socket.emit('close');

      assert.ok(endSpy.calledOnce);
      //assert.ok(errorSpy.calledOnce);
      assert.ok(closeSpy.calledOnce);

    });

    it('should report connect/disconnect status', function () {

      socket.emit('connect');

      assert.ok(client.isConnected());

      socket.emit('close');

      assert.ok(!client.isConnected());

      socket.emit('connect');

      assert.ok(client.isConnected());

      socket.emit('end');

      assert.ok(!client.isConnected());

    });


  });

  /**
   *  The actual requests are tested here
   */

    describe('Requests', function () {

        var client, tcpHeader;

        var SocketApi = function () {
            eventEmitter.call(this);

            this.write = function () { };
        };

        util.inherits(SocketApi, eventEmitter);

        /**
        *  The SocketApi's instance, gets initiated before each
        *  test.
        */
        var socket;

        beforeEach(function () {

            socket = new SocketApi();

            tcpHeader = tcpModbusClient.create(socket);

            client = modbusClient.create(
	            tcpHeader, 
	            modbusHandler.Client.ResponseHandler);

            socket.emit('connect');

        });

        /**
        *  Simply read input registers with success
        */

        it("should read input register just fine", function () {

            var cb = sinon.spy();

            client.readInputRegister(0, 1, cb);

            var res = Put()
                .word16be(0)   // transaction id
		        .word16be(0)   // protocol id
		        .word16be(5)   // length 
		        .word8(1)      // unit id
		        .word8(4)      // function code
		        .word8(2)      // byte count
		        .word16be(42)  // register 0 value
		        .buffer();

            socket.emit('data', res);

            assert.ok(cb.called);
            assert.deepEqual(cb.args[0][0], { fc: 4, byteCount: 2, register: [42]});

        });

        it('should handle responses coming in different order just fine', function () {

            var cb = sinon.spy();

            client.readInputRegister(0, 1, cb);
            client.readInputRegister(1, 1, cb);

            var res1 = Put()
                .word16be(0)
                .word16be(0)
                .word16be(5)
                .word8(1)       // header
	            .word8(4)  	    // function code
 		        .word8(2)  	    // byte count
  		        .word16be(42)   // register 0 value = 42
		        .buffer();

            var res2 = Put()
                .word16be(1)
                .word16be(0)
                .word16be(5)
                .word8(1)       // header
		        .word8(4)       // function code
                .word8(2)       // byte count
                .word16be(43)   // register 1 value = 43
                .buffer();

            socket.emit('data', res2); // second request finish first
            socket.emit('data', res1); // first request finish last

            assert.ok(cb.calledTwice);
            assert.deepEqual(
                cb.args[1][0], { 
                    fc: 4, byteCount: 2, register: [ 42 ]});
            assert.deepEqual(
                cb.args[0][0], { 
                    fc: 4, byteCount: 2, register: [ 43 ]});	

    });


    it('should handle two responses coming in at once', function () {

      var cb = sinon.spy();

      client.readInputRegister(0, 1, cb);
      client.readInputRegister(1, 1, cb);

      var res = Put().word16be(0).word16be(0).word16be(5).word8(1) // header packet 1
	          .word8(4)  	// function code
 		  .word8(2)  	// byte count
  		  .word16be(42) // register 0 value = 42
		  .word16be(1).word16be(0).word16be(5).word8(1) // header packet 2
		  .word8(4)     // function code
                  .word8(2)     // byte count
                  .word16be(43) // register 1 value = 43
                  .buffer();

      socket.emit('data', res); // first request finish last

      assert.ok(cb.calledTwice);
      assert.deepEqual(cb.args[0][0], { fc: 4, byteCount: 2, register: [ 42 ]});
      assert.deepEqual(cb.args[1][0], { fc: 4, byteCount: 2, register: [ 43 ]});	

    });


    /**
     *  Handle an error response 
     */

    it("should handle an error while reading input register", function () {

      var cb = sinon.spy();

      client.readInputRegister(0, 1, cb);

      var res = Put().word16be(0).word16be(0).word16be(3).word8(1) // header
		 .word8(0x84)  // error code
	         .word8(1)     // exception code
		 .buffer();

      socket.emit('data', res);

      assert.ok(cb.calledOnce);
      assert.equal(cb.args[0][0], null);
      assert.deepEqual(cb.args[0][1], { 
	errorCode: 0x84, 
	exceptionCode: 1, 
	message: 'ILLEGAL FUNCTION' });


    });

    it('should handle a read coil request', function () {

      var cb = sinon.spy();

      client.readCoils(0, 17, cb);

      var res = Put().word16be(0).word16be(0).word16be(6).word8(1) // header
		.word8(1)  // function code
		.word8(3)  // byte count
		.word8(85) // bits 0 - 7  = 01010101 = 85
		.word8(85) // bits 7 - 15 = 01010101 = 85
		.word8(1)  // bit 16      = 00000001 = 1
		.buffer();

      socket.emit('data', res);

      assert.ok(cb.calledOnce);
      assert.deepEqual(cb.args[0][0], {
	fc: 1, 
	byteCount: 3, 
	coils: [true, false, true, false, true, false, true, false, 
		true, false, true, false, true, false, true, false,
		true, false, false, false, false, false, false, false]
	});

    });

    it('should handle a write single coil request with value false', function () {

      var cb = sinon.spy();

      client.writeSingleCoil(13, false, cb);

      var res = Put().word16be(0).word16be(0).word16be(6).word8(1) // header
		.word8(5)     // function code
		.word16be(13) // output address
	        .word16be(0)  // off
		.buffer();

       socket.emit('data', res);

       assert.ok(cb.calledOnce);
       assert.deepEqual(cb.args[0][0], {
		fc: 5,
		outputAddress: 13,
	 	outputValue: false
       });


    });

    it('should handle a write single coil request with value true', function () {

      var cb = sinon.spy();

      client.writeSingleCoil(15, true, cb);

      var res = Put().word16be(0).word16be(0).word16be(6).word8(1)  // header
		.word8(5)         // function code
		.word16be(15)     // output address
		.word16be(0xFF00) // on 
		.buffer();

      socket.emit('data', res);
	
      assert.ok(cb.calledOnce);
      assert.deepEqual(cb.args[0][0], {
	  fc: 5,
	  outputAddress: 15,
	  outputValue: true
      });


    });

    it('should handle a write single register request', function () {

      var cb = sinon.spy();

      client.writeSingleRegister(13, 42, cb);

      var res = Put().word16be(0).word16be(0).word16be(6).word8(1)   // header
  		 .word8(6)      // function code
        	 .word16be(13)  // register address
	   	 .word16be(42)  // register value
		 .buffer();

       socket.emit('data', res);

       assert.ok(cb.calledOnce);
       assert.deepEqual(cb.args[0][0], {
          fc: 6,
          registerAddress: 13,
	  registerValue: 42
       });


    });

  });

});
