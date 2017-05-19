'use strict'

/* global describe, it */

let assert = require('assert')
let WriteSingleCoilRequest = require('../src/request/write-single-coil.js')
let WriteSingleCoilResponse = require('../src/response/write-single-coil.js')

describe('WriteSingleCoil Tests.', function () {
  describe('WriteSingleCoil Response', function () {
    it('should create a buffer from a write single coil message', function () {
      let request = new WriteSingleCoilRequest(10, true)
      let buffer = request.createPayload()
      let expected = Buffer.from([0x05, 0x00, 0x0a, 0xff, 0x00])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      let buffer = Buffer.from([0x05, 0x00, 0x0a, 0xff, 0x00])
      let message = WriteSingleCoilRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x05, message.fc)
      assert.equal(10, message.address)
      assert.equal(0xff00, message.value)
    })
    it('should return null on not enough buffer data', function () {
      let buffer = Buffer.from([0x05, 0x00])
      let message = WriteSingleCoilRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      let buffer = Buffer.from([0x06, 0x00, 0x0a, 0xff, 0x00])
      let message = WriteSingleCoilRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })

  describe('WriteSingleCoil Request', function () {

  })
})

