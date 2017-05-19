'use strict'

/* global describe, it */

let assert = require('assert')
let ReadHoldingRegistersRequest = require('../src/request/read-holding-registers.js')
let ReadDHoldingRegistersResponse = require('../src/response/read-holding-registers.js')

describe('ReadHoldingRegisters Tests.', function () {
  describe('ReadHoldingRegisters Response', function () {

  })
  describe('ReadHoldingRegisters Request', function () {
    it('should create a buffer from a read holding registers message', function () {
      let request = new ReadHoldingRegistersRequest(22, 33)
      let buffer = request.createPayload()
      let expected = Buffer.from([0x03, 0x00, 0x16, 0x00, 0x21])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      let buffer = Buffer.from([0x03, 0x00, 0x16, 0x00, 0x21])
      let message = ReadHoldingRegistersRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x03, message.fc)
      assert.equal(22, message.start)
      assert.equal(33, message.count)
    })
    it('should return null on not enough buffer data', function () {
      let buffer = Buffer.from([0x03, 0x00])
      let message = ReadHoldingRegistersRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      let buffer = Buffer.from([0x04, 0x00, 0x0a, 0x00, 0x0c])
      let message = ReadHoldingRegistersRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
})

