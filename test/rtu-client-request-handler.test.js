'use strict'

/* global describe, it, beforeEach */
let assert = require('assert')
let sinon = require('sinon')
let EventEmitter = require('events')
let ReadCoilsRequest = require('../src/request/read-holding-registers.js')
let ReadHoldingRegistersResponseBody = require('../src/response/read-holding-registers.js')
let ModbusRTUResponse = require('../src/rtu-response.js')
let ExceptionResponse = require('../src/response/exception.js')
let ModbusRTUClientRequestHandler = require('../src/rtu-client-request-handler.js')

describe('Modbus/RTU Client Request Tests', function () {
  let socket
  let socketMock

  beforeEach(function () {
    socket = new EventEmitter()
    socket.write = function () {}

    socketMock = sinon.mock(socket)
  })

  /* we are using the read coils function to test the rtu request specifics */
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
      let ReadHoldingRegistersRequestBody = require('../src/request/read-holding-registers.js')
      let handler = new ModbusRTUClientRequestHandler(socket, 1)
      let request = new ReadHoldingRegistersRequestBody(1, 1)
      let response = new ReadHoldingRegistersResponseBody(1, Buffer.from([0x00, 0x32]))
      let rtuResponse = new ModbusRTUResponse(1, 0x9139, response)

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
})
