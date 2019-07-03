'use strict'

/* global describe, it */

const assert = require('assert')
const WriteMultipleRegistersRequest = require('../dist/request/write-multiple-registers.js').default

describe('WriteMultipleRegisters Tests.', function () {
  describe('WriteMultipleRegisters Response', function () {

  })

  describe('WriteMultipleRegisters Request', function () {
    it('should create a buffer from a write multiple registers message', function () {
      const request = new WriteMultipleRegistersRequest(10, [0x0001, 0x0002, 0x1234, 0x4321])
      const buffer = request.createPayload()
      const expected = Buffer.from([0x10, 0x00, 0x0a, 0x00, 0x04, 0x08, 0x00, 0x01, 0x00, 0x02, 0x12, 0x34, 0x43, 0x21])

      assert.ok(request !== null)
      assert.ok(request.numberOfBytes, 8)

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      const buffer = Buffer.from([0x10, 0x00, 0x0a, 0x00, 0x04, 0x08, 0x00, 0x01, 0x00, 0x02, 0x12, 0x34, 0x43, 0x21])
      const message = WriteMultipleRegistersRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x10, message.fc)
      assert.equal(10, message.address)
      assert.equal(0x08, message.numberOfBytes)
      assert.deepEqual([0x0001, 0x0002, 0x1234, 0x4321], message.valuesAsArray)
      assert.deepEqual(Buffer.from([0x00, 0x01, 0x00, 0x02, 0x12, 0x34, 0x43, 0x21]), message.valuesAsBuffer)
    })
    it('should return null on not enough buffer data', function () {
      const buffer = Buffer.from([0x0f, 0x00])
      const message = WriteMultipleRegistersRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      const buffer = Buffer.from([0x11, 0x00, 0x0a, 0xff, 0x00])
      const message = WriteMultipleRegistersRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
})
