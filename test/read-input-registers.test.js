'use strict'

/* global describe, it */

let assert = require('assert')
let ReadInputRegistersRequest = require('../src/request/read-input-registers.js')

describe('ReadInputRegisters Tests.', function () {
  describe('ReadInputRegisters Response', function () {

  })
  describe('ReadInputRegisters Request', function () {
    it('should create a buffer from a read input registers message', function () {
      let request = new ReadInputRegistersRequest(22, 33)
      let buffer = request.createPayload()
      let expected = Buffer.from([0x04, 0x00, 0x16, 0x00, 0x21])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      let buffer = Buffer.from([0x04, 0x00, 0x16, 0x00, 0x21])
      let message = ReadInputRegistersRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x04, message.fc)
      assert.equal(22, message.start)
      assert.equal(33, message.count)
    })
    it('should return null on not enough buffer data', function () {
      let buffer = Buffer.from([0x04, 0x00])
      let message = ReadInputRegistersRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      let buffer = Buffer.from([0x05, 0x00, 0x0a, 0x00, 0x0c])
      let message = ReadInputRegistersRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
})
