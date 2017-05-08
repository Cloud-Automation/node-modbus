'use strict'

/* global describe, it, beforeEach */
let assert = require('assert')
let sinon = require('sinon')
let EventEmitter = require('events')

describe('TCP Modbus Request Tests', function () {
  let TCPRequestHandler = require('../src/tcp-client-request-handler.js')
  let socket
  let socketMock

  beforeEach(function () {
    socket = new EventEmitter()
    socket.write = function () { }

    socketMock = sinon.mock(socket)
  })

  describe('Register Request.', function () {
    let ReadCoilsRequest = require('../src/request/read-coils.js')
    it('should write a tcp request.', function () {
      let handler = new TCPRequestHandler(socket, 3)
      let readCoilsRequest = new ReadCoilsRequest(0xa0fa, 0x0120)
      let requestBuffer = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x03, 0x01, 0xa0, 0xfa, 0x01, 0x20])

      socket.emit('connect')

      socketMock.expects('write').once().withArgs(requestBuffer)

      /* should flush the request right away */
      let promise = handler.register(readCoilsRequest)

      assert.ok(promise instanceof Promise)

      socketMock.verify()
    })
  })

  describe('Read Discrete Inputs Tests.', function () {
    let ReadDiscreteInputsRequest = require('../src/request/read-discrete-inputs.js')
    it('should write a tcp request.', function () {
      let handler = new TCPRequestHandler(socket, 3)
      let request = new ReadDiscreteInputsRequest(0xa0fa, 0x0120)
      let requestBuffer = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x03, 0x02, 0xa0, 0xfa, 0x01, 0x20])

      socket.emit('connect')

      socketMock.expects('write').once().withArgs(requestBuffer)

      /* should flush the request right away */
      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Read Holding Registers Tests.', function () {
    let ReadHoldingRegistersRequest = require('../src/request/read-holding-registers.js')
    it('should write a tcp request.', function () {
      let handler = new TCPRequestHandler(socket, 3)
      let request = new ReadHoldingRegistersRequest(0xa0fa, 0x0120)
      let requestBuffer = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x03, 0x03, 0xa0, 0xfa, 0x01, 0x20])

      socket.emit('connect')

      socketMock.expects('write').once().withArgs(requestBuffer)

      /* should flush the request right away */
      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Read Input Registers Tests.', function () {
    let ReadInputRegistersRequest = require('../src/request/read-input-registers.js')
    it('should write a tcp request.', function () {
      let handler = new TCPRequestHandler(socket, 3)
      let request = new ReadInputRegistersRequest(0xa0fa, 0x0120)
      let requestBuffer = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x03, 0x04, 0xa0, 0xfa, 0x01, 0x20])

      socket.emit('connect')

      socketMock.expects('write').once().withArgs(requestBuffer)

      /* should flush the request right away */
      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Write Single Coil Tests.', function () {
    let WriteSingleCoilRequest = require('../src/request/write-single-coil.js')
    it('should write a tcp request.', function () {
      let handler = new TCPRequestHandler(socket, 3)
      let request = new WriteSingleCoilRequest(0x1234, true)
      let requestBuffer = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x03, 0x05, 0x12, 0x34, 0xff, 0x00])

      socket.emit('connect')

      socketMock.expects('write').once().withArgs(requestBuffer)

      /* should flush the request right away */
      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Write Single Register Tests.', function () {
    let WriteSingleRegisterRequest = require('../src/request/write-single-register.js')
    it('should write a tcp request.', function () {
      let handler = new TCPRequestHandler(socket, 3)
      let request = new WriteSingleRegisterRequest(0x1234, 0x4321)
      let requestBuffer = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x03, 0x06, 0x12, 0x34, 0x43, 0x21])

      socket.emit('connect')

      socketMock.expects('write').once().withArgs(requestBuffer)

      /* should flush the request right away */
      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Write multiple coils tests.', function () {
    let WriteMultipleCoilsRequest = require('../src/request/write-multiple-coils.js')
    it('should write a tcp request with array values.', function () {
      let handler = new TCPRequestHandler(socket, 3)
      let request = new WriteMultipleCoilsRequest(0x1234, [1, 0, 1, 1, 1, 0, 1, 1, 0])
      let requestBuffer = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x09, 0x03, 0x0F, 0x12, 0x34, 0x00, 0x09, 0x08, 0x00, 0xdd])

      socket.emit('connect')

      socketMock.expects('write').once().withArgs(requestBuffer)

      /* should flush the request right away */
      handler.register(request)

      socketMock.verify()
    })
    it('should write a tcp request with buffer.', function () {
      let handler = new TCPRequestHandler(socket, 3)
      let request = new WriteMultipleCoilsRequest(0x1234, Buffer.from([0x00, 0xdd]), 9)
      let requestBuffer = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x09, 0x03, 0x0F, 0x12, 0x34, 0x00, 0x09, 0x08, 0x00, 0xdd])

      socket.emit('connect')

      socketMock.expects('write').once().withArgs(requestBuffer)

      /* should flush the request right away */
      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Write Multiple Registers Tests.', function () {
    let WriteMultipleRegistersRequest = require('../src/request/write-multiple-registers.js')
    it('should write a tcp request with array values.', function () {
      let handler = new TCPRequestHandler(socket, 3)
      let request = new WriteMultipleRegistersRequest(0x1234, [0x0001, 0x0002, 0x0003, 0x4321])
      let requestBuffer = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x0F, 0x03, 0x10, 0x12, 0x34, 0x00, 0x07, 0x0e, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x43, 0x21])

      socket.emit('connect')

      socketMock.expects('write').once().withArgs(requestBuffer)

      /* should flush the request right away */
      handler.register(request)

      socketMock.verify()
    })
    it('should write a tcp request with buffer.', function () {
      let handler = new TCPRequestHandler(socket, 3)
      let request = new WriteMultipleRegistersRequest(0x1234, Buffer.from([0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x43, 0x21]))
      let requestBuffer = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x0F, 0x03, 0x10, 0x12, 0x34, 0x00, 0x07, 0x0e, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x43, 0x21])

      socket.emit('connect')

      socketMock.expects('write').once().withArgs(requestBuffer)

      /* should flush the request right away */
      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Timeout tests.', function () {
    let ReadCoilsRequest = require('../src/request/read-coils.js')
    it('should time out a unanswered tcp request', function (done) {
      let handler = new TCPRequestHandler(socket, 4, 100)
      let request = new ReadCoilsRequest(0x1234, Buffer.from([0x00, 0x01]))
      socket.emit('connect')

      let response = handler.register(request)

      response.then(function () {
        assert.ok(false)
        done()
      }).catch(function () {
        done()
      })
    })
  })
})
