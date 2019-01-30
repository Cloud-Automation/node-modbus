'use strict'

/* global describe, it, beforeEach */

const assert = require('assert')
const TCPResponseHandler = require('../src/tcp-client-response-handler.js')

describe('Modbus/TCP Client Response Handler Tests', function () {
  let handler

  beforeEach(function () {
    handler = new TCPResponseHandler()
  })

  /* we are using the read coils function to test the modbus/tcp specifics */

  it('should handle a valid read coils response', function () {
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x05, // byte count
      0x03,       // unit id
      0x01,       // function code
      0x02,       // byte count
      0xdd,       // coils
      0x00
    ])

    handler.handleData(responseBuffer)

    const response = handler.shift()

    assert.ok(response !== null)
    assert.equal(1, response.id)
    assert.equal(0, response.protocol)
    assert.equal(5, response.bodyLength)
    assert.equal(11, response.byteCount)
    assert.equal(3, response.unitId)
    assert.equal(1, response.body.fc)
    assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
  })
  it('should handle a exception', function () {
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x03, // byte count
      0x03,       // unit id
      0x81,       // exception code for fc 0x01
      0x01        // exception code ILLEGAL FUNCTION
    ])

    handler.handleData(responseBuffer)

    const response = handler.shift()

    assert.ok(response !== undefined)
    assert.equal(0x01, response.id)
    assert.equal(0x00, response.protocol)
    assert.equal(0x03, response.bodyLength)
    assert.equal(0x09, response.byteCount)
    assert.equal(0x03, response.unitId)
    assert.equal(0x01, response.body.fc)
    assert.equal(0x01, response.body.code)
    assert.equal('ILLEGAL FUNCTION', response.body.message)
  })
  it('should handle a chopped response', function () {
    const responseBufferA = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x05  // byte count
    ])
    const responseBufferB = Buffer.from([
      0x03,       // unit id
      0x01,       // function code
      0x02,       // byte count
      0xdd,       // coils
      0x00
    ])

      /* deliver first part */
    handler.handleData(responseBufferA)

    let response = handler.shift()

    assert.ok(response === undefined)

      /* deliver second part */
    handler.handleData(responseBufferB)

    response = handler.shift()

    assert.ok(response !== undefined)
    assert.equal(1, response.id)
    assert.equal(0, response.protocol)
    assert.equal(5, response.bodyLength)
    assert.equal(11, response.byteCount)
    assert.equal(3, response.unitId)
    assert.equal(1, response.body.fc)
    assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
  })
})
