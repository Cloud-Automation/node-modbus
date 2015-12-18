
var assert          = require("assert"),
    Put             = require('put'),
    sinon           = require('sinon'),
    util            = require('util'),
    eventEmitter    = require('events').EventEmitter;

describe("Modbus Serial Client", function () {

  var modbusClient, modbusHandler, socketApiDummy;

  beforeEach(function (done) {

    socketApiDummy = {
      on : function () { }
    };

    var dummy = function () { };

    modbusClient = require('../src/serialClient');
    modbusClient.setLogger(dummy);  // shut down the logger
    
    modbusHandler = require('../src/handler');
    modbusHandler.setLogger(dummy); // shut down the logger

    done();

  });

  afterEach(function (done) {

    var cName = require.resolve('../src/serialClient'),
        hName = require.resolve('../src/handler');
    
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
	.withArgs(sinon.match('close'), sinon.match.func);

    socketMock.expects('on').once()
	.withArgs(sinon.match('end'), sinon.match.func);

    var client = modbusClient.create(socketApiDummy);

    assert.ok(client);

    socketMock.verify();

  });

  /**
   *  The actual requests are tested here
   */

  describe('Requests', function () {

    var client;

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

        client = modbusClient.create(
            socket, 
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
	          .word8(4)  	// function code
 		  .word8(2)  	// byte count
  		  .word16be(42) // register 0 value = 42
		  .buffer();

      var res2 = Put()
		  .word8(4)     // function code
                  .word8(2)     // byte count
                  .word16be(43) // register 1 value = 43
                  .buffer();

      socket.emit('data', res2); // second request finish first
      socket.emit('data', res1); // first request finish last

      assert.ok(cb.calledTwice);
      assert.deepEqual(cb.args[1][0], { fc: 4, byteCount: 2, register: [ 42 ]});
      assert.deepEqual(cb.args[0][0], { fc: 4, byteCount: 2, register: [ 43 ]});	


    });


    it('should handle two responses coming in at once', function () {

      var cb = sinon.spy();

      client.readInputRegister(0, 1, cb);
      client.readInputRegister(1, 1, cb);

      var res1 = Put() // packet 1
	          .word8(4)  	// function code
 		  .word8(2)  	// byte count
  		  .word16be(42) // register 0 value = 42
                  .buffer();
       var res2 = Put()
		  .word8(4)     // function code
                  .word8(2)     // byte count
                  .word16be(43) // register 1 value = 43
                  .buffer();

      socket.emit('data', res1); 
      socket.emit('data', res2);

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

      var res = Put()
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

    it('should handle two responses coming in at once where one results in an error', function () {

      var cb = sinon.spy(),
          writeMock = sinon.mock(socket);

      var res1 = Put()  // packet 1
	      .word8(0x84) 	// function code
 		  .word8(0x02) 	// exception code
          .buffer(),
          res2 = Put()
		  .word8(4)     // function code
          .word8(2)     // byte count
          .word16be(43) // register 1 value = 43
          .buffer();

      writeMock.expects('write').twice();

      client.readInputRegister(0, 1, cb);
      client.readInputRegister(1, 1, cb);

      socket.emit('data', res1); 
      socket.emit('data', res2);

      assert.ok(cb.calledTwice);
      assert.deepEqual(cb.args[0][1], { errorCode: 0x84, exceptionCode: 0x2, message: 'ILLEGAL DATA ADDRESS' });
      assert.deepEqual(cb.args[1][0], { fc: 4, byteCount: 2, register: [ 43 ]});	

        writeMock.verify();

    });


    it('should handle a read coil request', function () {

      var cb = sinon.spy();

      client.readCoils(0, 17, cb);

      var res = Put()
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

      var res = Put()
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

      var res = Put()
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

      var res = Put()
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

    /**
     *  Simply read holding registers with success
     */

    it("should read holding register just fine", function () {

      var cb = sinon.spy();

      client.readHoldingRegister(0, 1, cb);

      var res = Put()
		.word8(3)      // function code
		.word8(2)      // byte count
		.word16be(42)  // register 0 value
		.buffer();

      socket.emit('data', res);

      assert.ok(cb.called);
      assert.deepEqual(cb.args[0][0], { fc: 3, byteCount: 2, register: [42]});

    });

    /**
     *  Write Multiple Coils with success
     */

    it("should write multiple coils just fine", function () {

      var cb = sinon.spy();

      client.writeMultipleCoils(123, [1, 0, 1, 0, 1, 0, 1, 1], cb);

      var res = Put()
		.word8(15)          // function code
		.word16be(123)      // start address
		.word16be(8)        // quantity of outputs
		.buffer();

      socket.emit('data', res);

      assert.ok(cb.called);
      assert.deepEqual(cb.args[0][0], { fc: 15, startAddress: 123, quantity: 8 });

    });

    /**
     *  Write Multiple Coils with too many coils
     */

    it("should not write multiple coils due to too much coils", function () {

      var cb = sinon.spy(),
            coils = [];

        for (var i = 0; i < 1969; i += 1) {
            coils.push(1);
        }

      client.writeMultipleCoils(123, coils,  cb);

      assert.ok(cb.called);
      assert.ok(cb.args[0][1]);

    });




  });

});
