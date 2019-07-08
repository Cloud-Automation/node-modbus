'use strict'

/* global describe, it */

const assert = require('assert')
const ReadDiscreteInputsRequest = require('../dist/request/read-discrete-inputs.js').default
const ReadDiscreteInputsResponse = require('../dist/response/read-discrete-inputs.js').default

describe('ReadDiscreteInputs Tests.', function () {
  describe('ReadDiscreteInputs Response', function () {
    it('should create a buffer from a read discrete inputs message', function () {
      const response = new ReadDiscreteInputsResponse([1, 0, 1, 0, 1, 0, 1, 0, 1, 0], 2)
      const buffer = response.createPayload()
      const expected = Buffer.from([0x02, 0x02, 0x55, 0x01])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message object from a buffer', function () {
      const buffer = Buffer.from([0x02, 0x02, 0x55, 0x01])
      const message = ReadDiscreteInputsResponse.fromBuffer(buffer)

      assert.equal(0x02, message.fc)
      assert.equal(0x02, message.numberOfBytes)
      assert.deepEqual([1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0], message.valuesAsArray)
      assert.deepEqual(Buffer.from([0x55, 0x01]), message.valuesAsBuffer)
    })
    it('should return null on not enough buffer data', function () {
      const buffer = Buffer.from([0x02])
      const message = ReadDiscreteInputsResponse.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      const buffer = Buffer.from([0x03, 0x03, 0x0a, 0x00, 0x0c])
      const message = ReadDiscreteInputsResponse.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })

  describe('ReadDiscreteInputs Requests', function () {
    it('should create a buffer from a discrete inputs message', function () {
      const readDiscreteInputsRequest = new ReadDiscreteInputsRequest(22, 33)
      const buffer = readDiscreteInputsRequest.createPayload()
      const expected = Buffer.from([0x02, 0x00, 0x16, 0x00, 0x21])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      const buffer = Buffer.from([0x02, 0x00, 0x16, 0x00, 0x21])
      const message = ReadDiscreteInputsRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x02, message.fc)
      assert.equal(22, message.start)
      assert.equal(33, message.count)
    })
    it('should return null on not enough buffer data', function () {
      const buffer = Buffer.from([0x02, 0x00])
      const message = ReadDiscreteInputsRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      const buffer = Buffer.from([0x03, 0x00, 0x0a, 0x00, 0x0c])
      const message = ReadDiscreteInputsRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
})
