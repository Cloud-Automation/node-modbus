'use strict'

/* global describe, it */

const assert = require('assert')
const ResponseFactory = require('../dist/response/response-factory.js').default
const ReadCoilsResponseBody = require('../dist/response/read-coils.js').default

describe('Modbus Response Tests.', function () {
  /* with the read coils tests we test most of the common errors
   * like modbus exceptions, outOfSync errors, timeouts and so on */
  describe('Read Coils Tests.', function () {
    it('should create request from buffer', function () {
      const buffer = Buffer.from([
        0x01,       // fc
        0x02,       // byte count
        0xdd,       // coils
        0x00
      ])

      const response = ResponseFactory.fromBuffer(buffer)

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
      const buffer = Buffer.from([
        0x01,       // fc
        0x02,       // byte count
        0xdd       // coils
      ])

      const response = ReadCoilsResponseBody.fromBuffer(buffer)

      assert.ok(response === null)
    })
  })
})
