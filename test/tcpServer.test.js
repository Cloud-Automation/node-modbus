
var assert = require('assert'),
    Put = require('put'),
    sinon = require('sinon'),
    util = require('util'),
    eventEmitter = require('events').EventEmitter;

describe('Modbus TCP/IP Server', function () {

  var modbusServer, socketApiDummy;

  beforeEach(function (done) {

    socketApiDummy  = {
      on : function () { }
    };

    var dummy = function () { };

    modbusServer = require('../src/tcpServer');
    modbusServer.setLogger(dummy);

    done();

  });

  afterEach(function (done) {

    var name = require.resolve('../src/tcpServer');

    delete require.cache[name];

    done();

  });

  it('should do the setup', function () {

    var socketMock = sinon.mock(socketApiDummy);

    socketMock.expects('on').once()
	.withArgs(sinon.match('data'), sinon.match.func);

    // TODO: handle errors

    var server = modbusServer.create(socketApiDummy);

    assert.ok(server);

    socketMock.verify();

  });

  describe('Requests/Responses', function () {

    var server;

    var SocketApi = function () {

      eventEmitter.call(this);
      this.write = function () { };
    };

    util.inherits(SocketApi, eventEmitter);

    var socket;

    beforeEach(function (done) {
      socket = new SocketApi();

      server = modbusServer.create(socket);

      done();
    });

    it('should read a simple request', function () {

      var onDataSpy = sinon.spy();

      server.on('data', onDataSpy);

      var res = Put()
		.word16be(0)	// transaction id
		.word16be(0)	// protocol version
		.word16be(6)	// byte count
		.word8(1)	// unit id
		.word8(4)	// function code
		.word16be(2)	// start address
		.word16be(42)	// quantity
		.buffer();

      var exRes = Put()
		.word8(4)	// function code
		.word16be(2)	// start address
		.word16be(42)	// quantity
		.buffer();

      socket.emit('data', res);

      assert.ok(onDataSpy.called);
      assert.deepEqual(onDataSpy.args[0][0], exRes);

    });

    it('should respond', function () {

      var writeSpy = sinon.spy(socket, 'write');

      var req = Put()
 	.word16be(0)	// transaction id
	.word16be(0)	// protocol version
	.word16be(6)	// byte count
	.word8(1)	// unit id
	.word8(4)	// function code  ( starting here it really didn't matter )
	.word16be(2)	// start address
	.word16be(2)    // quantitiy
	.buffer();

      var res = Put()
	.word8(4)	// function code
	.word8(4)       // byte count
	.word16be(13)   // reg[2]
	.word16be(14)	// reg[3]
	.buffer();

      var exReq = Put()
	.word16be(0)	// transaction id
	.word16be(0)	// protocol version
	.word16be(7)	// byte count
	.word8(1)	// unit id
	.word8(4)	// function code
	.word8(4)	// byte count
        .word16be(13)	// reg[2]
	.word16be(14)	// reg[3]
	.buffer();

      socket.emit('data', req);

      server.write(res);

      assert.ok(writeSpy.calledOnce);
      assert.deepEqual(writeSpy.args[0][0], exReq); 

    });

    it('should disgard a wrong message', function () {

      var onDataSpy = sinon.spy();

      var req = Put().word16be(22).buffer(); // this packet doesn't make sense
     
      socket.emit('data', req);

      assert.equal(onDataSpy.callCount, 0);

    });

    it('should disgard a message with a wrong pdu', function () {

      var onDataSpy = sinon.spy();

      var req = Put()
	.word16be(0)   // MBAP Header Start
	.word16be(0)
	.word16be(6)
	.word8(1)      // MBAP Header End
	.word16be(22)  // Nonsense
	.word8be(22)   // Nonsense
	.buffer();

      socket.emit('data', req);

      assert.equal(onDataSpy.callCount, 0);

    });

  });

});
