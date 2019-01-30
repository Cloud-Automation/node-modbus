'use strict'

/* global describe, it */

const assert = require('assert')
const WriteSingleRegisterRequest = require('../src/request/write-single-register.js')

describe('WriteSingleRegister Tests.', function () {
  describe('WriteSingleRegister Response', function () {

  })

  describe('WriteSingleRegister Request', function () {
    it('should create a buffer from a write single register message', function () {
      const request = new WriteSingleRegisterRequest(10, 0x1234)
      const buffer = request.createPayload()
      const expected = Buffer.from([0x06, 0x00, 0x0a, 0x12, 0x34])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      const buffer = Buffer.from([0x06, 0x00, 0x0a, 0x12, 0x34])
      const message = WriteSingleRegisterRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x06, message.fc)
      assert.equal(10, message.address)
      assert.equal(0x1234, message.value)
    })
    it('should return null on not enough buffer data', function () {
      const buffer = Buffer.from([0x05, 0x00])
      const message = WriteSingleRegisterRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      const buffer = Buffer.from([0x07, 0x00, 0x0a, 0xff, 0x00])
      const message = WriteSingleRegisterRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
})
