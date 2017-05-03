'use strict'

/* global describe, it, beforeEach */
let sinon = require('sinon')
let EventEmitter = require('events')

describe('RTU Modbus Request Tests', function () {
  let RTURequestHandler = require('../src/rtu-request-handler.js')
  let socket
  let socketMock

  beforeEach(function () {
    socket = new EventEmitter()
    socket.write = function () { }

    socketMock = sinon.mock(socket)
  })

  describe('Read Coils Tests.', function () {
    let ReadCoilsRequest = require('../src/request/read-coils.js')
    it('should write a rtu request', function () {
      let handler = new RTURequestHandler(socket, 4)
      let readCoilsRequest = new ReadCoilsRequest(0x4321, 0x1234)
      let requestBuffer = Buffer.from([0x04, 0x01, 0x43, 0x21, 0x12, 0x34, 0x39, 0x51])

      socketMock.expects('write').once().withArgs(requestBuffer)

      handler.register(readCoilsRequest)

      socketMock.verify()
    })
  })

  describe('Read Discrete Inputs Tests.', function () {
    let ReadDiscreteInputsRequest = require('../src/request/read-discrete-inputs.js')
    it('should write a rtu request', function () {
      let handler = new RTURequestHandler(socket, 4)
      let request = new ReadDiscreteInputsRequest(0x4321, 0x1234)
      let requestBuffer = Buffer.from([0x04, 0x02, 0x43, 0x21, 0x12, 0x34, 0x39, 0x15])

      socketMock.expects('write').once().withArgs(requestBuffer)

      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Read Holding Registers Tests.', function () {
    let ReadHoldingRegistersRequest = require('../src/request/read-holding-registers.js')
    it('should write a rtu request', function () {
      let handler = new RTURequestHandler(socket, 4)
      let request = new ReadHoldingRegistersRequest(0x4321, 0x1234)
      let requestBuffer = Buffer.from([0x04, 0x03, 0x43, 0x21, 0x12, 0x34, 0xf9, 0x28])

      socketMock.expects('write').once().withArgs(requestBuffer)

      handler.register(request)

      socketMock.verify()
    })
  })

  describe('Read Input Registers Tests.', function () {
    let ReadInputRegistersRequest = require('../src/request/read-input-registers.js')
    it('should write a rtu request', function () {
      let handler = new RTURequestHandler(socket, 4)
      let request = new ReadInputRegistersRequest(0x4321, 0x1234)
      let requestBuffer = Buffer.from([0x04, 0x04, 0x43, 0x21, 0x12, 0x34, 0x39, 0x9d])

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
})
