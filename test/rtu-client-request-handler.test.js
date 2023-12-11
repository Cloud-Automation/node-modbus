'use strict'

/* global describe, it, beforeEach */
const assert = require('assert')
const sinon = require('sinon')
const EventEmitter = require('events')
const ReadCoilsRequest = require('../dist/request/read-holding-registers.js').default
const ReadHoldingRegistersResponseBody = require('../dist/response/read-holding-registers.js').default
const ReadHoldingRegistersRequestBody = require('../dist/request/read-holding-registers.js').default
const ModbusRTUResponse = require('../dist/rtu-response.js').default
const ExceptionResponse = require('../dist/response/exception.js').default
const ModbusRTUClientRequestHandler = require('../dist/rtu-client-request-handler.js').default
const Modbus = require('../dist/modbus.js')


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
      const handler = new ModbusRTUClientRequestHandler(socket, 4)
      const readCoilsRequest = new ReadCoilsRequest(0x4321, 0x0120)

      socket.emit('open')

      socketMock.expects('write').once()

      const promise = handler.register(readCoilsRequest)

      assert.ok(promise instanceof Promise)

      socketMock.verify()
    })
  })

  describe('Handle Data Tests.', function () {
    it('should register an rtu request and handle a response', function (done) {
      const handler = new ModbusRTUClientRequestHandler(socket, 1)
      const request = new ReadHoldingRegistersRequestBody(0, 1)
      const response = new ReadHoldingRegistersResponseBody(1, Buffer.from([0x00, 0x32]))
      const rtuResponse = new ModbusRTUResponse(1, 0x91C9, response)

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
      const handler = new ModbusRTUClientRequestHandler(socket, 4)
      const request = new ReadCoilsRequest(0x0000, 0x0008)
      const response = new ExceptionResponse(0x01, 0x01)
      const rtuResponse = new ModbusRTUResponse(4, 37265, response)

      socket.emit('open')

      socketMock.expects('write').once()

      handler.register(request)
        .then(function (resp) {
          assert.ok(false)

          done()
        }).catch(function (err) {
          // Exception type should be ModbusException not crcMismatch or any other 
          assert.equal(err.err, 'ModbusException')
          assert.equal(err.request instanceof Modbus.ModbusRTURequest, true)
          socketMock.verify()

          done()
        })

      handler.handle(rtuResponse)
    })

    it('should calculate exception response crc correctly', function (done) {
      const handler = new ModbusRTUClientRequestHandler(socket, 1)
      const request = new ReadHoldingRegistersRequestBody(0x4000, 0x0002)
      const responseBuffer = Buffer.from([
        0x01,       // address
        0x83,       // fc
        0x02,       // error code
        0xc0, 0xf1  // crc              
      ])
      const rtuResponse = ModbusRTUResponse.fromBuffer(responseBuffer)

      socket.emit('open')

      socketMock.expects('write').once()

      handler.register(request)
        .then(function (resp) {          
          assert.ok(false)

          done()
        }).catch(function (err) {     
          // Exception type should be ModbusException not crcMismatch or any other 
          assert.equal(err.err, 'ModbusException')
          assert.equal(err.request instanceof Modbus.ModbusRTURequest, true)
          socketMock.verify()

          done()
        })

      handler.handle(rtuResponse)
      // rtuResponse.crc
      
    })
  })
})
