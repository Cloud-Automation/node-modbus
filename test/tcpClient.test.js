
var assert = require('assert'),
    Put = require('put'),
    sinon = require('sinon'),
    util = require('util'),
    eventEmitter = require('events').EventEmitter;

describe('Modbus TCP/IP Client', function () {

  var modbusClient, socketApiDummy;

  beforeEach(function (done) {

    socketApiDummy  = {
      on : function () { }
    };

    var dummy = function () { };

    modbusClient = require('../src/tcpClient');
    modbusClient.setLogger(dummy);

    done();

  });

  afterEach(function (done) {

    var name = require.resolve('../src/tcpClient');

    delete require.cache[name];

    done();

  });

  it('should do the setup', function () {

    var socketMock = sinon.mock(socketApiDummy);

    socketMock.expects('on').once()
	.withArgs(sinon.match('data'), sinon.match.func);

    socketMock.expects('on').once()
	.withArgs(sinon.match('connect'), sinon.match.func);

    socketMock.expects('on').once()
	.withArgs(sinon.match('end'), sinon.match.func)
    socketMock.expects('on').once()
	.withArgs(sinon.match('error'), sinon.match.func);
    socketMock.expects('on').once()
	.withArgs(sinon.match('close'), sinon.match.func);

    // TODO: handle errors

    var client = modbusClient.create(socketApiDummy);

    assert.ok(client);

    socketMock.verify();

  });

  describe('Requests/Responses', function () {

    var client;

    var SocketApi = function () {

      eventEmitter.call(this);
      this.write = function () { };
    };

    util.inherits(SocketApi, eventEmitter);

    var socket;

    beforeEach(function (done) {
      socket = new SocketApi();

      client = modbusClient.create(socket);

      done();
    });

    it('should read a simple request', function () {

      var onDataSpy = sinon.spy();

      client.on('data', onDataSpy);

      var res = Put()
		.word16be(0)
		.word16be(0)
		.word16be(5)
		.word8(1)
		.word8(4)
		.word8(2)
		.word16be(42)
		.buffer();

      var exRes = Put()
		.word8(4)
		.word8(2)
		.word16be(42)
		.buffer();

      socket.emit('data', res);

      assert.ok(onDataSpy.called);
      assert.deepEqual(onDataSpy.args[0][0], exRes);

    });

    it('should respond', function () {

     var writeSpy = sinon.spy(socket, 'write');

     var req = Put()
		.word8(4)
		.word16be(2)
		.word16be(12)
		.buffer();

      var exReq = Put()
		.word16be(0)
		.word16be(0)
		.word16be(6)
		.word8(1)
		.word8(4)
		.word16be(2)
		.word16be(12)
		.buffer();

     socket.emit('connect');
     client.write(req);

     assert.ok(writeSpy.calledOnce);
     assert.deepEqual(writeSpy.args[0][0], exReq); 

    });

  });

});
