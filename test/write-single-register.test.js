'use strict'

/* global describe, it */

let assert = require('assert')
let WriteSingleRegisterRequest = require('../src/request/write-single-register.js')
let WriteSingleRegisterResponse = require('../src/response/write-single-register.js')

describe('WriteSingleRegister Tests.', function () {
  describe('WriteSingleRegister Response', function () {

  })

  describe('WriteSingleRegister Request', function () {
    it('should create a buffer from a write single register message', function () {
      let request = new WriteSingleRegisterRequest(10, 0x1234)
      let buffer = request.createPayload()
      let expected = Buffer.from([0x06, 0x00, 0x0a, 0x12, 0x34])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      let buffer = Buffer.from([0x06, 0x00, 0x0a, 0x12, 0x34])
      let message = WriteSingleRegisterRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x06, message.fc)
      assert.equal(10, message.address)
      assert.equal(0x1234, message.value)
    })
    it('should return null on not enough buffer data', function () {
      let buffer = Buffer.from([0x05, 0x00])
      let message = WriteSingleRegisterRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      let buffer = Buffer.from([0x07, 0x00, 0x0a, 0xff, 0x00])
      let message = WriteSingleRegisterRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
})
