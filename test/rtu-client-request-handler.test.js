'use strict'

/* global describe, it, beforeEach */
let assert = require('assert')
let sinon = require('sinon')
let EventEmitter = require('events')
let ReadCoilsRequest = require('../src/request/read-coils.js')
let ReadCoilsResponse = require('../src/response/read-coils.js')
let ModbusRTUResponse = require('../src/rtu-response.js')
let ExceptionResponse = require('../src/response/exception.js')

describe('Modbus/RTU Client Request Tests', function () {
  let ModbusRTUClientRequestHandler = require('../src/rtu-client-request-handler.js')
  let socket
  let socketMock

  beforeEach(function () {
    socket = new EventEmitter()
    socket.write = function () { }

    socketMock = sinon.mock(socket)
  })

  describe('Register Test.', function () {
    it('should register an rtu request', function () {
      let handler = new ModbusRTUClientRequestHandler(socket, 4)
      let readCoilsRequest = new ReadCoilsRequest(0x4321, 0x0120)

      socket.emit('open')

      socketMock.expects('write').once()

      let promise = handler.register(readCoilsRequest)

      assert.ok(promise instanceof Promise)

      socketMock.verify()
    })
  })

  describe('Handle Data Tests.', function () {
    it('should register an rtu request and handle a response', function (done) {
      let ReadCoilsRequest = require('../src/request/read-coils.js')
      let handler = new ModbusRTUClientRequestHandler(socket, 4)
      let request = new ReadCoilsRequest(0x0000, 0x0008)
      let response = new ReadCoilsResponse([0, 1, 0, 1, 0, 1, 0, 1], 8)
      let rtuResponse = new ModbusRTUResponse(4, 61472, response)

      socket.emit('open')

      socketMock.expects('write').once()

      handler.register(request)
        .then(function (resp) {
          assert.ok(true)
          socketMock.verify()

          done()
        }).catch(function () {
          assert.ok(false)
          done()
        })

      handler.handle(rtuResponse)
    })
    it('should register an rtu request and handle a exception response', function (done) {
      let ReadCoilsRequest = require('../src/request/read-coils.js')
      let handler = new ModbusRTUClientRequestHandler(socket, 4)
      let request = new ReadCoilsRequest(0x0000, 0x0008)
      let response = new ExceptionResponse(0x81, 0x01)
      let rtuResponse = new ModbusRTUResponse(4, 8352, response)

      socket.emit('open')

      socketMock.expects('write').once()

      handler.register(request)
        .then(function (resp) {
          assert.ok(false)

          done()
        }).catch(function () {
          assert.ok(true)
          socketMock.verify()

          done()
        })

      handler.handle(rtuResponse)
    })
  })
/*
  describe('Read Discrete Inputs Tests.', function () {
    let ReadDiscreteInputsRequest = require('../src/request/read-discrete-inputs.js')
    it('should write a rtu request', function () {
      let handler = new RTURequestHandler(socket, 4)
      let request = new ReadDiscreteInputsRequest(0x4321, 0x0120)
      let requestBuffer = Buffer.from([0x04, 0x02, 0x43, 0x21, 0x01, 0x20, 0x06, 0x18])

      socketMock.expects('write').once().withArgs(requestBuffer)

      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Read Holding Registers Tests.', function () {
    let ReadHoldingRegistersRequest = require('../src/request/read-holding-registers.js')
    it('should write a rtu request', function () {
      let handler = new RTURequestHandler(socket, 4)
      let request = new ReadHoldingRegistersRequest(0x4321, 0x0120)
      let requestBuffer = Buffer.from([0x04, 0x03, 0x43, 0x21, 0x01, 0x20, 0xc6, 0x25])

      socketMock.expects('write').once().withArgs(requestBuffer)

      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Read Input Registers Tests.', function () {
    let ReadInputRegistersRequest = require('../src/request/read-input-registers.js')
    it('should write a rtu request', function () {
      let handler = new RTURequestHandler(socket, 4)
      let request = new ReadInputRegistersRequest(0x4321, 0x0120)
      let requestBuffer = Buffer.from([0x04, 0x04, 0x43, 0x21, 0x01, 0x20, 0x06, 0x90])

      socketMock.expects('write').once().withArgs(requestBuffer)

      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Write Single Coil Tests.', function () {
    let WriteSingleCoilRequest = require('../src/request/write-single-coil.js')
    it('should write a rtu request', function () {
      let handler = new RTURequestHandler(socket, 4)
      let request = new WriteSingleCoilRequest(0x1234, true)
      let requestBuffer = Buffer.from([0x04, 0x05, 0x12, 0x34, 0xff, 0x00, 0x46, 0xed])

      socketMock.expects('write').once().withArgs(requestBuffer)

      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Write Single Register Tests.', function () {
    let WriteSingleRegisterRequest = require('../src/request/write-single-register.js')
    it('should write a rtu request', function () {
      let handler = new RTURequestHandler(socket, 4)
      let request = new WriteSingleRegisterRequest(0x1234, 0x4321)
      let requestBuffer = Buffer.from([0x04, 0x06, 0x12, 0x34, 0x43, 0x21, 0x9e, 0x19])

      socketMock.expects('write').once().withArgs(requestBuffer)

      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Write multiple coils tests.', function () {
    let WriteMultipleCoilsRequest = require('../src/request/write-multiple-coils.js')

    it('should write a rtu request with array', function () {
      let handler = new RTURequestHandler(socket, 4)
      let request = new WriteMultipleCoilsRequest(0x1234, [1, 0, 1, 1, 1, 0, 1, 1, 0])
      let requestBuffer = Buffer.from([0x04, 0x0F, 0x12, 0x34, 0x00, 0x09, 0x02, 0x00, 0xdd, 0x3b, 0x54])

      socketMock.expects('write').once().withArgs(requestBuffer)

      handler.register(request)

      socketMock.verify()
    })
    it('should write a rtu request with buffer', function () {
      let handler = new RTURequestHandler(socket, 4)
      let request = new WriteMultipleCoilsRequest(0x1234, Buffer.from([0x00, 0xdd]), 9)
      let requestBuffer = Buffer.from([0x04, 0x0F, 0x12, 0x34, 0x00, 0x09, 0x02, 0x00, 0xdd, 0x3b, 0x54])

      socketMock.expects('write').once().withArgs(requestBuffer)

      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Write Multiple Registers Tests.', function () {
    let WriteMultipleRegistersRequest = require('../src/request/write-multiple-registers.js')

    it('should write a rtu request with array', function () {
      let handler = new RTURequestHandler(socket, 4)
      let request = new WriteMultipleRegistersRequest(0x1234, [0x0001, 0x0002, 0x0003, 0x4321])
      let requestBuffer = Buffer.from([0x04, 0x10, 0x12, 0x34, 0x00, 0x04, 0x08, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x43, 0x21, 0xb1, 0x7c])

      socketMock.expects('write').once().withArgs(requestBuffer)

      handler.register(request)

      socketMock.verify()
    })
    it('should write a rtu request with buffer', function () {
      let handler = new RTURequestHandler(socket, 4)
      let request = new WriteMultipleRegistersRequest(0x1234, Buffer.from([0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x43, 0x21]))
      let requestBuffer = Buffer.from([0x04, 0x10, 0x12, 0x34, 0x00, 0x04, 0x08, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x43, 0x21, 0xb1, 0x7c])

      socketMock.expects('write').once().withArgs(requestBuffer)

      handler.register(request)

      socketMock.verify()
    })
  })

*/
})
