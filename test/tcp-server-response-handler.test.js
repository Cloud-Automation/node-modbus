'use strict'

/* global describe, it */

const assert = require('assert')
const ReadCoilsResponseBody = require('../dist/response/read-coils.js').default
const ReadDiscreteInputsResponseBody = require('../dist/response/read-discrete-inputs.js').default
const ReadHoldingRegistersResponseBody = require('../dist/response/read-holding-registers.js').default
const ReadInputRegistersResponseBody = require('../dist/response/read-input-registers.js').default
const WriteSingleCoilResponseBody = require('../dist/response/write-single-coil.js').default
const WriteSingleRegisterResponseBody = require('../dist/response/write-single-register.js').default
const WriteMultipleCoilsResponseBody = require('../dist/response/write-multiple-coils.js').default
const WriteMultipleRegistersResponseBody = require('../dist/response/write-multiple-registers.js').default
const ModbusTCPResponse = require('../dist/tcp-response.js').default
const ModbusTCPRequest = require('../dist/tcp-request.js').default

describe('Modbus/TCP Server Response Handler Tests', function () {
  /* we are using the read coils function to test the modbus/tcp specifics */

  it('should handle a valid read coils request', function () {
    const requestBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x06, // byte count
      0x01, // unit id
      0x01, // function code
      0x00, 0x00, // starting address
      0x00, 0x08 // quantity
    ])

    const coils = Buffer.from([
      0x01
    ])

    const request = ModbusTCPRequest.fromBuffer(requestBuffer)
    const responseBody = ReadCoilsResponseBody.fromRequest(request.body, coils)
    const response = ModbusTCPResponse.fromRequest(request, responseBody)
    const payload = response.createPayload()
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x04, // byte count
      0x01, // unit id
      0x01, // function code
      0x01, // byte count
      0x01 // coils
    ])

    assert(payload.equals(responseBuffer))
  })

  it('should handle a valid read discrete inputs request', function () {
    const requestBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x06, // byte count
      0x01, // unit id
      0x02, // function code
      0x00, 0x00, // starting address
      0x00, 0x03 // quantity
    ])

    const discreteInputs = Buffer.from([
      0xff
    ])

    const request = ModbusTCPRequest.fromBuffer(requestBuffer)
    const responseBody = ReadDiscreteInputsResponseBody.fromRequest(request.body, discreteInputs)
    const response = ModbusTCPResponse.fromRequest(request, responseBody)
    const payload = response.createPayload()
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x04, // byte count
      0x01, // unit id
      0x02, // function code
      0x01, // byte count
      0x07 // coils
    ])

    assert(payload.equals(responseBuffer))
  })

  it('should handle a valid read holding registers request', function () {
    const requestBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x06, // byte count
      0x01, // unit id
      0x03, // function code
      0x00, 0x00, // starting address
      0x00, 0x03 // quantity
    ])

    const holdingRegisters = Buffer.from([
      0xff, 0x10,
      0x07, 0x08,
      0x01, 0x10,
      0xff, 0x88
    ])

    const request = ModbusTCPRequest.fromBuffer(requestBuffer)
    const responseBody = ReadHoldingRegistersResponseBody.fromRequest(request.body, holdingRegisters)
    const response = ModbusTCPResponse.fromRequest(request, responseBody)
    const payload = response.createPayload()
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x09, // byte count
      0x01, // unit id
      0x03, // function code
      0x06, // byte count
      0xff, 0x10, // coils
      0x07, 0x08, // coils
      0x01, 0x10 // coils
    ])
    assert(payload.equals(responseBuffer))
  })

  it('should handle a valid read input registers request', function () {
    const requestBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x06, // byte count
      0x01, // unit id
      0x04, // function code
      0x00, 0x00, // starting address
      0x00, 0x03 // quantity
    ])

    const inputRegisters = Buffer.from([
      0xff, 0x10,
      0x07, 0x08,
      0x01, 0x10,
      0xff, 0x88
    ])

    const request = ModbusTCPRequest.fromBuffer(requestBuffer)
    const responseBody = ReadInputRegistersResponseBody.fromRequest(request.body, inputRegisters)
    const response = ModbusTCPResponse.fromRequest(request, responseBody)
    const payload = response.createPayload()
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x09, // byte count
      0x01, // unit id
      0x04, // function code
      0x06, // byte count
      0xff, 0x10, // coils
      0x07, 0x08, // coils
      0x01, 0x10 // coils
    ])
    assert(payload.equals(responseBuffer))
  })

  it('should handle a valid write coil request', function () {
    const requestBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x06, // byte count
      0x01, // unit id
      0x05, // function code
      0x00, 0x02, // output address
      0xff, 0x00 // output value
    ])

    const request = ModbusTCPRequest.fromBuffer(requestBuffer)
    const responseBody = WriteSingleCoilResponseBody.fromRequest(request.body)
    const response = ModbusTCPResponse.fromRequest(request, responseBody)
    const payload = response.createPayload()
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x06, // byte count
      0x01, // unit id
      0x05, // function code
      0x00, 0x02, // output address
      0xff, 0x00 // output value
    ])
    assert(payload.equals(responseBuffer))
  })

  it('should handle a valid write register request', function () {
    const requestBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x06, // byte count
      0x01,       // unit id
      0x06,       // function code
      0x00, 0x02, // output address
      0xff, 0xff  // output value
    ])

    const request = ModbusTCPRequest.fromBuffer(requestBuffer)
    const responseBody = WriteSingleRegisterResponseBody.fromRequest(request.body)
    const response = ModbusTCPResponse.fromRequest(request, responseBody)
    const payload = response.createPayload()
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x06, // byte count
      0x01,       // unit id
      0x06,       // function code
      0x00, 0x02, // output address
      0xff, 0xff  // output value
    ])
    assert(payload.equals(responseBuffer))
  })

  it('should handle a valid write multiple coils request', function () {
    const requestBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x09, // byte count
      0x01,       // unit id
      0x0f,       // function code
      0x00, 0x02, // starting address
      0x00, 0x10, // quantity of outputs
      0x02,       // byte count
      0xff, 0xff  // outputs value
    ])

    const request = ModbusTCPRequest.fromBuffer(requestBuffer)
    const responseBody = WriteMultipleCoilsResponseBody.fromRequest(request.body)
    const response = ModbusTCPResponse.fromRequest(request, responseBody)
    const payload = response.createPayload()
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x06, // byte count
      0x01,       // unit id
      0x0f,       // function code
      0x00, 0x02, // output address
      0x00, 0x10  // quantity of outputs
    ])
    assert(payload.equals(responseBuffer))
  })

  it('should handle a valid write multiple registers request', function () {
    const requestBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x0b, // byte count
      0x01,       // unit id
      0x10,       // function code
      0x00, 0x01, // starting address
      0x00, 0x02, // quantity of outputs
      0x04,       // byte count
      0x00, 0x0a, // outputs value
      0x01, 0x02  // outputs value
    ])

    const request = ModbusTCPRequest.fromBuffer(requestBuffer)
    const responseBody = WriteMultipleRegistersResponseBody.fromRequest(request.body)
    const response = ModbusTCPResponse.fromRequest(request, responseBody)
    const payload = response.createPayload()
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x06, // byte count
      0x01,       // unit id
      0x10,       // function code
      0x00, 0x01, // output address
      0x00, 0x02  // quantity of outputs
    ])
    assert(payload.equals(responseBuffer))
  })
})
