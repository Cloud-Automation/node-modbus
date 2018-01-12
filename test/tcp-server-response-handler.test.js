'use strict'

let assert = require('assert')
let ReadCoilsResponseBody = require('../src/response/read-coils.js')
let ReadDiscreteInputsResponseBody = require('../src/response/read-discrete-inputs.js')
let ReadHoldingRegistersResponseBody = require('../src/response/read-holding-registers.js')
let ModbusTCPResponse = require('../src/tcp-response.js')
let ModbusTCPRequest = require('../src/tcp-request.js')

describe('Modbus/TCP Server Response Handler Tests', function () {

  /* we are using the read coils function to test the modbus/tcp specifics */

  it('should handle a valid read coils request', function () {
    let requestBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x06, // byte count
      0x01,       // unit id
      0x01,       // function code
      0x00, 0x00, // starting address
      0x00, 0x08  // quantity
    ])

    let coils = Buffer.from([
      0x01
    ])

    let request = ModbusTCPRequest.fromBuffer(requestBuffer)
    let responseBody = ReadCoilsResponseBody.fromRequest(request.body, coils)
    let response = ModbusTCPResponse.fromRequest(request, responseBody)
    let payload = response.createPayload()
    let responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x04, // byte count
      0x01,       // unit id
      0x01,       // function code
      0x01,       // byte count
      0x01        // coils
    ])

    assert(payload.equals(responseBuffer))
  })

  it('should handle a valid read discrete inputs request', function () {
    let requestBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x06, // byte count
      0x01,       // unit id
      0x02,       // function code
      0x00, 0x00, // starting address
      0x00, 0x03  // quantity
    ])

    let discreteInputs = Buffer.from([
      0xff
    ])

    let request = ModbusTCPRequest.fromBuffer(requestBuffer)
    let responseBody = ReadDiscreteInputsResponseBody.fromRequest(request.body, discreteInputs)
    let response = ModbusTCPResponse.fromRequest(request, responseBody)
    let payload = response.createPayload()
    let responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x04, // byte count
      0x01,       // unit id
      0x02,       // function code
      0x01,       // byte count
      0x07        // coils
    ])

    assert(payload.equals(responseBuffer))
  })

  it('should handle a valid read holding registers request', function () {
    let requestBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x06, // byte count
      0x01,       // unit id
      0x03,       // function code
      0x00, 0x00, // starting address
      0x00, 0x03  // quantity
    ])

    let holdingRegisters = Buffer.from([
      0xff, 0x10,
      0x07, 0x08,
      0x01, 0x10,
      0xff, 0x88,
    ])

    let request = ModbusTCPRequest.fromBuffer(requestBuffer)
    let responseBody = ReadHoldingRegistersResponseBody.fromRequest(request.body, holdingRegisters)
    let response = ModbusTCPResponse.fromRequest(request, responseBody)
    let payload = response.createPayload()
    let responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x09, // byte count
      0x01,       // unit id
      0x03,       // function code
      0x06,       // byte count
      0xff, 0x10, // coils
      0x07, 0x08, // coils
      0x01, 0x10, // coils
    ])
    assert(payload.equals(responseBuffer))
  })
})
