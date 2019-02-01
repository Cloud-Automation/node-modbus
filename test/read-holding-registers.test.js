'use strict'

/* global describe, it */

const assert = require('assert')
const ReadHoldingRegistersRequest = require('../src/request/read-holding-registers.js')

describe('ReadHoldingRegisters Tests.', function () {
  describe('ReadHoldingRegisters Response', function () {

  })
  describe('ReadHoldingRegisters Request', function () {
    it('should create a buffer from a read holding registers message', function () {
      const request = new ReadHoldingRegistersRequest(22, 33)
      const buffer = request.createPayload()
      const expected = Buffer.from([0x03, 0x00, 0x16, 0x00, 0x21])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      const buffer = Buffer.from([0x03, 0x00, 0x16, 0x00, 0x21])
      const message = ReadHoldingRegistersRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x03, message.fc)
      assert.equal(22, message.start)
      assert.equal(33, message.count)
    })
    it('should return null on not enough buffer data', function () {
      const buffer = Buffer.from([0x03, 0x00])
      const message = ReadHoldingRegistersRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      const buffer = Buffer.from([0x04, 0x00, 0x0a, 0x00, 0x0c])
      const message = ReadHoldingRegistersRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
})
