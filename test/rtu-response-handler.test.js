'use strict'

/* global describe, it, beforeEach */

let assert = require('assert')

describe('RTU Modbus Response Tests', function () {
  let RTUResponseHandler = require('../src/rtu-response-handler.js')
  let handler

  beforeEach(function () {
    handler = new RTUResponseHandler()
  })

  describe('Read Coils Test', function () {
    it('should handle a valid read coils response', function () {
      let responseBuffer = Buffer.from([
        0x01,       // address
        0x01,       // function code
        0x02,       // byte count
        0xdd,       // coils
        0x00,
        0x00, 0x00 // crc
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.address)
      assert.equal(0, response.crc)
      assert.equal(7, response.length)

      assert.equal(1, response.body.fc)
      assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.coils)
      assert.deepEqual(Buffer.from([0xdd, 0x00]), response.body.payload)
    })
    it('should handle a exception', function () {
      let responseBuffer = Buffer.from([
        0x01,       // address
        0x81,       // exception code for fc 0x01
        0x01,       // exception code ILLEGAL FUNCTION
        0x00, 0x00  // crc
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== undefined)
      assert.equal(0x01, response.address)
      assert.equal(0x01, response.body.fc)
      assert.equal(0x01, response.body.code)
      assert.equal('ILLEGAL FUNCTION', response.body.message)
    })
    it('should handle a chopped response', function () {
      let responseBufferA = Buffer.from([
        0x01       // address
      ])
      let responseBufferB = Buffer.from([
        0x01,       // function code
        0x02,       // byte count
        0xdd,       // coils
        0x00,
        0x00, 0x00  // crc
      ])

      /* deliver first part */
      handler.handleData(responseBufferA)

      let response = handler.shift()

      assert.ok(response === undefined)

      /* deliver second part */
      handler.handleData(responseBufferB)

      response = handler.shift()

      assert.ok(response !== undefined)
      assert.equal(1, response.address)
      assert.equal(1, response.body.fc)
      assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.coils)
    })
  })

  describe('Read Discrete Inputs Test', function () {
    it('should handle a valid read discrete inputs response', function () {
      let responseBuffer = Buffer.from([
        0x01,       // address
        0x02,       // function code
        0x02,       // byte count
        0xdd,       // coils
        0x00,
        0x00, 0x00  // crc
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== undefined)
      assert.equal(1, response.address)
      assert.equal(2, response.body.fc)
      assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.coils)
    })
  })

  describe('Read Holding Registers Test', function () {
    it('should handle a valid read holding registers response', function () {
      let responseBuffer = Buffer.from([
        0x01,       // address
        0x03,       // function code
        0x04,       // byte count
        0x12, 0x34, // regiser
        0x43, 0x21,
        0x00, 0x00  // crc
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.address)
      assert.equal(3, response.body.fc)
      assert.deepEqual([0x1234, 0x4321], response.body.values)
      assert.deepEqual(Buffer.from([0x12, 0x34, 0x43, 0x21]), response.body.payload)
    })
  })
  describe('Read Input Registers Test', function () {
    it('should handle a valid read input registers response', function () {
      let responseBuffer = Buffer.from([
        0x01,       // address
        0x04,       // function code
        0x04,       // byte count
        0x12, 0x34, // regiser
        0x43, 0x21,
        0x00, 0x00  // crc
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.address)
      assert.equal(4, response.body.fc)
      assert.deepEqual([0x1234, 0x4321], response.body.values)
      assert.deepEqual(Buffer.from([0x12, 0x34, 0x43, 0x21]), response.body.payload)
    })
  })
  describe('Write Single Coil Test', function () {
    it('should handle a valid write single coil response', function () {
      let responseBuffer = Buffer.from([
        0x01,       // address
        0x05,       // function code
        0x43, 0x21, // address
        0xff, 0x00, // value
        0x00, 0x00 // crc
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.address)
      assert.equal(5, response.body.fc)
      assert.equal(0x4321, response.body.address)
      assert.ok(response.body.value)
    })
  })
  describe('Write Single Register Test', function () {
    it('should handle a valid write single register response', function () {
      let responseBuffer = Buffer.from([
        0x01,       // address
        0x06,       // function code
        0x43, 0x21, // address
        0x12, 0x34, // value
        0x00, 0x00  // crc
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.address)
      assert.equal(6, response.body.fc)
      assert.equal(0x4321, response.body.address)
      assert.equal(0x1234, response.body.value)
    })
  })
  describe('Write Multiple Coils Test', function () {
    it('should handle a valid write multiple coils response', function () {
      let responseBuffer = Buffer.from([
        0x01,       // address
        0x0f,       // function code
        0x43, 0x21, // address
        0x12, 0x34, // value
        0x00, 0x00  // crc
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(15, response.body.fc)
      assert.equal(0x4321, response.body.start)
      assert.equal(0x1234, response.body.quantity)
    })
  })
  describe('Write Multiple Registers Test', function () {
    it('should handle a valid write multiple registers response', function () {
      let responseBuffer = Buffer.from([
        0x01,       // address
        0x10,       // function code
        0x43, 0x21, // address
        0x12, 0x34, // quantity
        0x00, 0x00  // crc
      ])

      handler.handleData(responseBuffer)

      let response = handler.shift()

      assert.ok(response !== null)
      assert.equal(1, response.address)
      assert.equal(16, response.body.fc)
      assert.equal(0x4321, response.body.start)
      assert.equal(0x1234, response.body.quantity)
    })
  })
})

