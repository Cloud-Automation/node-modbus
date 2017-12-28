'use strict'

let assert = require('assert')
let ReadCoilsResponseBody = require('../src/response/read-coils.js')
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

    assert(payload = responseBuffer)
  })
})
