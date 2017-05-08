'use strict'

/* global describe, it, beforeEach */

let assert = require('assert')

describe('Modbus/TCP Client Response Handler Tests', function () {
  let TCPResponseHandler = require('../src/tcp-client-response-handler.js')
  let handler

  beforeEach(function () {
    handler = new TCPResponseHandler()
  })

  describe('Read Coils Test', function () {
    it('should handle a valid read coils response', function () {
      let responseBuffer = Buffer.from([
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

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.id)
      assert.equal(0, response.protocol)
      assert.equal(5, response.bodyLength)
      assert.equal(11, response.byteCount)
      assert.equal(3, response.unitId)
      assert.equal(1, response.body.fc)
      assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.coils)
    })
    it('should handle a exception', function () {
      let responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x03, // byte count
        0x03,       // unit id
        0x81,       // exception code for fc 0x01
        0x01        // exception code ILLEGAL FUNCTION
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

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
      let responseBufferA = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x05  // byte count
      ])
      let responseBufferB = Buffer.from([
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
      assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.coils)
    })
  })

  describe('Read Discrete Inputs Test', function () {
    it('should handle a valid read discrete inputs response', function () {
      let responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x05, // byte count
        0x03,       // unit id
        0x02,       // function code
        0x02,       // byte count
        0xdd,       // coils
        0x00
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.id)
      assert.equal(0, response.protocol)
      assert.equal(5, response.bodyLength)
      assert.equal(11, response.byteCount)
      assert.equal(3, response.unitId)
      assert.equal(2, response.body.fc)
      assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.coils)
    })
  })
  describe('Read Holding Registers Test', function () {
    it('should handle a valid read holding registers response', function () {
      let responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x07, // byte count
        0x03,       // unit id
        0x03,       // function code
        0x04,       // byte count
        0x12, 0x34, // regiser
        0x43, 0x21
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.id)
      assert.equal(0, response.protocol)
      assert.equal(7, response.bodyLength)
      assert.equal(13, response.byteCount)
      assert.equal(3, response.unitId)
      assert.equal(3, response.body.fc)
      assert.deepEqual([0x1234, 0x4321], response.body.values)
    })
  })
  describe('Read Input Registers Test', function () {
    it('should handle a valid read input registers response', function () {
      let responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x07, // byte count
        0x03,       // unit id
        0x04,       // function code
        0x04,       // byte count
        0x12, 0x34, // regiser
        0x43, 0x21
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.id)
      assert.equal(0, response.protocol)
      assert.equal(7, response.bodyLength)
      assert.equal(13, response.byteCount)
      assert.equal(3, response.unitId)
      assert.equal(4, response.body.fc)
      assert.deepEqual([0x1234, 0x4321], response.body.values)
    })
  })
  describe('Write Single Coil Test', function () {
    it('should handle a valid write single coil response', function () {
      let responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x03,       // unit id
        0x05,       // function code
        0x43, 0x21, // address
        0xff, 0x00  // value
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.id)
      assert.equal(0, response.protocol)
      assert.equal(6, response.bodyLength)
      assert.equal(12, response.byteCount)
      assert.equal(3, response.unitId)
      assert.equal(5, response.body.fc)
      assert.equal(0x4321, response.body.address)
      assert.ok(response.body.value)
    })
  })
  describe('Write Single Register Test', function () {
    it('should handle a valid write single register response', function () {
      let responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x03,       // unit id
        0x06,       // function code
        0x43, 0x21, // address
        0x12, 0x34  // value
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.id)
      assert.equal(0, response.protocol)
      assert.equal(6, response.bodyLength)
      assert.equal(12, response.byteCount)
      assert.equal(3, response.unitId)
      assert.equal(6, response.body.fc)
      assert.equal(0x4321, response.body.address)
      assert.equal(0x1234, response.body.value)
    })
  })
  describe('Write Multiple Coils Test', function () {
    it('should handle a valid write multiple coils response', function () {
      let responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x03,       // unit id
        0x0f,       // function code
        0x43, 0x21, // address
        0x12, 0x34  // value
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.id)
      assert.equal(0, response.protocol)
      assert.equal(6, response.bodyLength)
      assert.equal(12, response.byteCount)
      assert.equal(3, response.unitId)
      assert.equal(15, response.body.fc)
      assert.equal(0x4321, response.body.start)
      assert.equal(0x1234, response.body.quantity)
    })
  })
  describe('Write Multiple Registers Test', function () {
    it('should handle a valid write multiple registers response', function () {
      let responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x03,       // unit id
        0x10,       // function code
        0x43, 0x21, // address
        0x12, 0x34  // quantity
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.id)
      assert.equal(0, response.protocol)
      assert.equal(6, response.bodyLength)
      assert.equal(12, response.byteCount)
      assert.equal(3, response.unitId)
      assert.equal(16, response.body.fc)
      assert.equal(0x4321, response.body.start)
      assert.equal(0x1234, response.body.quantity)
    })
  })
})

