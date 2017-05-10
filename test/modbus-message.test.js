'use strict'

/* global describe, it */

let assert = require('assert')

describe('Modbus Messages Tests', function () {
  describe('ReadCoils Tests.', function () {
    let ReadCoilsRequest = require('../src/request/read-coils.js')
    it('should create a buffer from a read coils message', function () {
      let readCoilsRequest = new ReadCoilsRequest(10, 12)
      let buffer = readCoilsRequest.createPayload()
      let expected = Buffer.from([0x01, 0x00, 0x0a, 0x00, 0x0c])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message object from a buffer', function () {
      let buffer = Buffer.from([0x01, 0x00, 0x0a, 0x00, 0x0c])
      let message = ReadCoilsRequest.fromBuffer(buffer)

      assert.equal(0x01, message.fc)
      assert.equal(10, message.start)
      assert.equal(12, message.count)
    })
    it('should return null on not enough buffer data', function () {
      let buffer = Buffer.from([0x01, 0x00])
      let message = ReadCoilsRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      let buffer = Buffer.from([0x02, 0x00, 0x0a, 0x00, 0x0c])
      let message = ReadCoilsRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
  describe('ReadDiscreteInputs', function () {
    let ReadDiscreteInputsRequest = require('../src/request/read-discrete-inputs.js')
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
