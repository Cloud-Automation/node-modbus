
var assert = require('assert'),
    util = require('util'),
    Put = require('put'),
    sinon = require('sinon'),
    eventEmitter = require('events').EventEmitter;

/**
 *  Integration test for the tcp and serial modules
 */
describe('Modbus TCP/IP Server', function () {

  var serialServer, tcpServer, modbusHandler, socketApiDummy;


  /**
   *  Setup socketApiDummy and load modbusServer module
   */   
  beforeEach(function (done) {

    socketApiDummy = {
      on     : function () { },
      write  : function () { },
      pipe   : function () { }
    };

    var dummy = function () { };

    serialServer = require('../src/serialServer');
    serialServer.setLogger(dummy);

    tcpServer = require('../src/tcpServer');
    tcpServer.setLogger(dummy);

    modbusHandler = require('../src/handler');
    modbusHandler.setLogger(dummy);

    done();
  });

  /**
   *  Remove module from cache so that it can be reloaded
   */
  afterEach(function (done) {

    var serialName = require.resolve('../src/serialServer'),
        tcpName = require.resolve('../src/tcpServer');

    delete require.cache[serialName];
    delete require.cache[tcpName];
    
    done();
  });

  /**
   *  Test for socket initialisation 
   */
  it('should do the setup', function () {

    var	socketMock = sinon.mock(socketApiDummy);

    socketMock.expects('on').once()
	.withArgs(sinon.match('data'), sinon.match.func);

//    socketMock.expects('on').once()
//	.withArgs(sinon.match('end'), sinon.match.func);

    var tServer = tcpServer.create(socketApiDummy);
    var sServer = serialServer.create(tServer);

    socketMock.verify();

  });

  describe('Requests', function () {

    var server;

    /**
     *  SocketApi is a Mock for simulating the socket
     *  therefor it uses the events.EventEmitter Module
     */
    var SocketApi = function () {
      eventEmitter.call(this);

      this.write = function () { };
      this.pipe = function () { };
    };

    util.inherits(SocketApi, eventEmitter);

    /**
     *  The SocketApi's instance, gets initiated before
     *  every test.
     */
    var socket;

    beforeEach(function (done) {

      socket = new SocketApi();

      var tServer = tcpServer.create(socket);

      server = serialServer.create(
        tServer,
        modbusHandler.Server.RequestHandler,
        modbusHandler.Server.ResponseHandler);

      done();
 
    });

    /**
     *  Make a request through the socket.emit call and
     *  check what socket.write will be called with
     */
    it('should respond to a readCoils function call', function () {

      var handler = sinon.stub().returns(
		[[true, false, true, true, false, true, false, true, true, false, true]]);

      server.addHandler(1, handler);

      var req = Put()
		.word16be(0)   // transaction id   // MBPA Header
		.word16be(0)   // protocol version
   		.word16be(6)   // byte count
		.word8(1)      // unit id
  	        .word8(1)      // function code    // PDU
	        .word16be(13)  // start address
		.word16be(11)   // quantity
		.buffer();

      var res = Put()
		.word16be(0)   // transaction id    // MBPA Header
		.word16be(0)   // protocol vesion
		.word16be(5)   // byte count
		.word8(1)      // unit id
		.word8(1)      // function code     // PDU
		.word8(2)      // byte count
		.word8(173)    // 0x10101101 -> reg[13] - reg[20]
		.word8(5)      // 0x00000101 -> reg[20] - reg[23]
		.buffer();

      var spy = sinon.spy(socket, "write");

      socket.emit('data', req);

      assert.ok(handler.called);
      assert.deepEqual(handler.args[0], [13, 11]);
      assert.deepEqual(res, spy.getCall(0).args[0]);

    });

    it('should respond to a readInputRegister function call', function () {
      
      var stub = sinon.stub()
		.withArgs(13, 2)
		.returns([[13, 22]]);

      server.addHandler(4, stub);

      var req = Put()
		.word16be(0)   // transaction id   // MBPA Header
		.word16be(0)   // protocol version
   		.word16be(6)   // byte count
		.word8(1)      // unit id
  	        .word8(4)      // function code    // PDU
	        .word16be(13)  // start address
		.word16be(2)   // quantity
		.buffer();

       var res = Put()
		.word16be(0)   // transaction id    // MBPA Header
		.word16be(0)   // protocol version
		.word16be(7)   // byte count
		.word8(1)      // unit id
		.word8(4)      // function code     // PDU
		.word8(4)      // byte count
		.word16be(13)  // register[13] = 13
    		.word16be(22)  // register[14] = 22
		.buffer();

       var spy = sinon.spy(socket, 'write');

       socket.emit('data', req);
  
       assert.ok(stub.called);
       assert.deepEqual(stub.args[0], [13, 2]); 
       assert.deepEqual(res, spy.getCall(0).args[0]);
    });

    it('should respond with an error response', function () {

      var req = Put()
		.word16be(0)   // transaction id    // MBPA Header
		.word16be(0)   // protocol version
    		.word16be(6)   // byte count
		.word8(1)      // unit id
		.word8(4)      // function code     // PDU
		.word16be(13)  // start address
  		.word16be(2)   // quantity
		.buffer();

       var res = Put()
		.word16be(0)   // transaction id    // MBPA Header
		.word16be(0)   // protocol version
		.word16be(3)   // byte count
		.word8(1)      // unit id
		.word8(0x84)   // error code (0x04 + 0x80)
		.word8(0x01)   // expection code (illegal function)
		.buffer();

        var spy = sinon.spy(socket, 'write');

	socket.emit('data', req);
	
	assert.deepEqual(res, spy.getCall(0).args[0]);

    });


  });

});
