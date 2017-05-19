'use strict'

/* global describe, it */

let assert = require('assert')
let ResponseBody = require('../src/response/response-body.js')
let ReadCoilsResponseBody = require('../src/response/read-coils.js')

describe('Modbus Response Tests.', function () {
  /* with the read coils tests we test most of the common errors
   * like modbus exceptions, outOfSync errors, timeouts and so on */
  describe('Read Coils Tests.', function () {
    it('should create request from buffer', function () {
      let buffer = Buffer.from([
        0x01,       // fc
        0x02,       // byte count
        0xdd,       // coils
        0x00
      ])

      let response = ResponseBody.fromBuffer(buffer)

      assert.ok(response !== null)
      assert.ok(response instanceof ReadCoilsResponseBody)
      assert.equal(0x01, response.fc)
      assert.equal(0x02, response.numberOfBytes)
      assert.equal(0x04, response.byteCount)
      assert.deepEqual(
        [true,
        false,
        true,
        true,
        true,
        false,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false], response.valuesAsArray)
    })
    it('should handle invalid buffer content', function () {
      let buffer = Buffer.from([
        0x01,       // fc
        0x02,       // byte count
        0xdd       // coils
      ])

      let response = ReadCoilsResponseBody.fromBuffer(buffer)

      assert.ok(response === null)
    })
  })
})
