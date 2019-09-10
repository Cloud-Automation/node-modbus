'use strict'

/* global describe, it */

const assert = require('assert')
const ReadInputRegistersRequest = require('../src/request/read-input-registers.js')
const ReadInputRegistersResponse = require('../src/response/read-input-registers.js')

describe('ReadInputRegisters Tests.', function () {
  describe('ReadInputRegisters Response', function () {
    it('should create a response from a buffer', function () {
      const request = new ReadInputRegistersRequest(0, 1)
      const inputRegisters = Buffer.from([0x01, 0x00, 0x02, 0x00, 0xFF, 0xFF])
      const response = ReadInputRegistersResponse.fromRequest(request, inputRegisters)
      const respPayload = response.createPayload()
      const expected = Buffer.from([0x04, 0x02, 0x01, 0x00])

      assert.deepEqual(respPayload, expected)
    })
    it('should create a response with constructor from array', function () {
      const response = new ReadInputRegistersResponse(6, [0x01, 0x02, 0xFFFE])
      const respPayload = response.createPayload()
      const expected = Buffer.from([0x04, 0x06, 0x00, 0x01, 0x00, 0x02, 0xFF, 0xFE])

      assert.deepEqual(respPayload, expected)
    })
  })
  describe('ReadInputRegisters Request', function () {
    it('should create a buffer from a read input registers message', function () {
      const request = new ReadInputRegistersRequest(22, 33)
      const buffer = request.createPayload()
      const expected = Buffer.from([0x04, 0x00, 0x16, 0x00, 0x21])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      const buffer = Buffer.from([0x04, 0x00, 0x16, 0x00, 0x21])
      const message = ReadInputRegistersRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x04, message.fc)
      assert.equal(22, message.start)
      assert.equal(33, message.count)
    })
    it('should return null on not enough buffer data', function () {
      const buffer = Buffer.from([0x04, 0x00])
      const message = ReadInputRegistersRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      const buffer = Buffer.from([0x05, 0x00, 0x0a, 0x00, 0x0c])
      const message = ReadInputRegistersRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
})
