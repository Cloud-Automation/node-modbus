'use strict'

/* global describe, it */

let assert = require('assert')
let ReadCoilsRequest = require('../src/request/read-coils.js')
let ReadCoilsResponse = require('../src/response/read-coils.js')
let ModbusRequestBody = require('../src/request/request-body.js')

describe('ReadCoils Tests.', function () {
  describe('ReadCoils Response', function () {
    it('should create a buffer from a read coils message', function () {
      let response = new ReadCoilsResponse([1, 0, 1, 0, 1, 0, 1, 0, 1, 0], 2)
      let buffer = response.createPayload()
      let expected = Buffer.from([0x01, 0x02, 0x55, 0x01])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message object from a buffer', function () {
      let buffer = Buffer.from([0x01, 0x02, 0x55, 0x01])
      let message = ReadCoilsResponse.fromBuffer(buffer)

      assert.equal(0x01, message.fc)
      assert.equal(0x02, message.numberOfBytes)
      assert.deepEqual([1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0], message.valuesAsArray)
      assert.deepEqual(Buffer.from([0x55, 0x01]), message.valuesAsBuffer)
    })
    it('should mask out extra bits', function () {
      let requestBody = ModbusRequestBody.fromBuffer(Buffer.from([0x01, 0x00, 0x00, 0x00, 0x09]))
      let coils = Buffer.from([0xff, 0xff])
      let response = ReadCoilsResponse.fromRequest(requestBody, coils)
      let buffer = response.createPayload()
      let expected = Buffer.from([0x01, 0x02, 0xff, 0x01])

      assert.deepEqual(expected, buffer)
    })
    it('should return null on not enough buffer data', function () {
      let buffer = Buffer.from([0x01])
      let message = ReadCoilsResponse.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      let buffer = Buffer.from([0x02, 0x03, 0x0a, 0x00, 0x0c])
      let message = ReadCoilsResponse.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })

  describe('ReadCoils Requests', function () {
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
})
