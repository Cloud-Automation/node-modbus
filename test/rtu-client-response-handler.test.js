'use strict'

/* global describe, it, beforeEach */

const assert = require('assert')
const ModbusRTUClientResponseHandler = require('../src/rtu-client-response-handler.js')

describe('Modbus/RTU Client Response Tests', function () {
  let handler

  beforeEach(function () {
    handler = new ModbusRTUClientResponseHandler()
  })

  /* we are using the read coils function to test rtu specifics */
  it('should handle a valid read coils response', function () {
    const responseBuffer = Buffer.from([
      0x01,       // address
      0x01,       // function code
      0x02,       // byte count
      0xdd,       // coils
      0x00,
      0xCD, 0xAB // crc
    ])

    handler.handleData(responseBuffer)

    const response = handler.shift()

    assert.ok(response !== null)
    assert.equal(1, response.address)
    assert.equal(1, response.body.fc)
    assert.equal(0xABCD, response.crc)
    assert.equal(7, response.byteCount)

    assert.equal(1, response.body.fc)
    assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
  })
  it('should handle a exception', function () {
    const responseBuffer = Buffer.from([
      0x01,       // address
      0x81,       // exception code for fc 0x01
      0x01,       // exception code ILLEGAL FUNCTION
      0x00, 0x00  // crc
    ])

    handler.handleData(responseBuffer)

    const response = handler.shift()

    assert.ok(response !== undefined)
    assert.equal(0x01, response.address)
    assert.equal(0x01, response.body.fc)
    assert.equal(0x01, response.body.code)
    assert.equal('ILLEGAL FUNCTION', response.body.message)
  })
  it('should handle a chopped response', function () {
    const responseBufferA = Buffer.from([
      0x01       // address
    ])
    const responseBufferB = Buffer.from([
      0x01,       // function code
      0x02,       // byte count
      0xdd,       // coils
      0x00,
      0x00, 0x00  // crc
    ])

    handler.handleData(responseBufferA)

    let response = handler.shift()

    assert.ok(response === undefined)

    handler.handleData(responseBufferB)

    response = handler.shift()

    assert.ok(response !== undefined)
    assert.equal(1, response.address)
    assert.equal(1, response.body.fc)
    assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
  })
})
