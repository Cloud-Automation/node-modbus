'use strict'

/* global describe, it */

let assert = require('assert')
let ReadDiscreteInputsRequest = require('../src/request/read-discrete-inputs.js')
let ReadDiscreteInputsResponse = require('../src/response/read-discrete-inputs.js')

describe('ReadDiscreteInputs Tests.', function () {
  describe('ReadDiscreteInputs Response', function () {
    it('should create a buffer from a read discrete inputs message', function () {
      let response = new ReadDiscreteInputsResponse([1, 0, 1, 0, 1, 0, 1, 0, 1, 0], 2)
      let buffer = response.createPayload()
      let expected = Buffer.from([0x02, 0x02, 0x55, 0x01])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message object from a buffer', function () {
      let buffer = Buffer.from([0x02, 0x02, 0x55, 0x01])
      let message = ReadDiscreteInputsResponse.fromBuffer(buffer)

      assert.equal(0x02, message.fc)
      assert.equal(0x02, message.numberOfBytes)
      assert.deepEqual([1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0], message.valuesAsArray)
      assert.deepEqual(Buffer.from([0x55, 0x01]), message.valuesAsBuffer)
    })
    it('should return null on not enough buffer data', function () {
      let buffer = Buffer.from([0x02])
      let message = ReadDiscreteInputsResponse.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      let buffer = Buffer.from([0x03, 0x03, 0x0a, 0x00, 0x0c])
      let message = ReadDiscreteInputsResponse.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })

  describe('ReadDiscreteInputs Requests', function () {
    it('should create a buffer from a discrete inputs message', function () {
      let readDiscreteInputsRequest = new ReadDiscreteInputsRequest(22, 33)
      let buffer = readDiscreteInputsRequest.createPayload()
      let expected = Buffer.from([0x02, 0x00, 0x16, 0x00, 0x21])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      let buffer = Buffer.from([0x02, 0x00, 0x16, 0x00, 0x21])
      let message = ReadDiscreteInputsRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x02, message.fc)
      assert.equal(22, message.start)
      assert.equal(33, message.count)
    })
    it('should return null on not enough buffer data', function () {
      let buffer = Buffer.from([0x02, 0x00])
      let message = ReadDiscreteInputsRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      let buffer = Buffer.from([0x03, 0x00, 0x0a, 0x00, 0x0c])
      let message = ReadDiscreteInputsRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
})
