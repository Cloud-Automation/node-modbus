'use strict'

/* global describe, it */

let assert = require('assert')
let WriteMultipleCoilsRequest = require('../src/request/write-multiple-coils.js')

describe('WriteMultipleCoils Tests.', function () {
  describe('WriteMultipleCoils Response', function () {

  })

  describe('WriteMultipleCoils Request', function () {
    it('should create a buffer from a write multiple coils message', function () {
      let request = new WriteMultipleCoilsRequest(10, [1, 0, 1, 0, 0, 1, 0, 1, 1])
      let buffer = request.createPayload()
      let expected = Buffer.from([0x0F, 0x00, 0x0a, 0x00, 0x09, 0x02, 0xa5, 0x01])

      assert.ok(request !== null)
      assert.ok(request.numberOfBytes, 2)

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      let buffer = Buffer.from([0x0f, 0x00, 0x0a, 0x00, 0x09, 0x02, 0xa5, 0x01])
      let message = WriteMultipleCoilsRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x0f, message.fc)
      assert.equal(10, message.address)
      assert.equal(0x02, message.numberOfBytes)
      assert.deepEqual([1, 0, 1, 0, 0, 1, 0, 1, 1], message.valuesAsArray)
      assert.deepEqual(Buffer.from([0xa5, 0x01]), message.valuesAsBuffer)
    })
    it('should return null on not enough buffer data', function () {
      let buffer = Buffer.from([0x0f, 0x00])
      let message = WriteMultipleCoilsRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      let buffer = Buffer.from([0x10, 0x00, 0x0a, 0xff, 0x00])
      let message = WriteMultipleCoilsRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
})
