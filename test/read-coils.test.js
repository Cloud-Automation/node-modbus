'use strict'

/* global describe, it */

const assert = require('assert')

const ModbusTCPRequest = require('../src/tcp-request.js')
const ModbusTCPResponse = require('../src/tcp-response.js')
const ReadCoilsRequest = require('../src/request/read-coils.js')
const ReadCoilsResponse = require('../src/response/read-coils.js')
const ModbusRequestBody = require('../src/request/request-body.js')

describe('ReadCoils Tests.', function () {
  describe('ReadCoils Response', function () {
    it('should create a buffer from a read coils message', function () {
      const response = new ReadCoilsResponse([1, 0, 1, 0, 1, 0, 1, 0, 1, 0], 2)
      const buffer = response.createPayload()
      const expected = Buffer.from([0x01, 0x02, 0x55, 0x01])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message object from a buffer', function () {
      const buffer = Buffer.from([0x01, 0x02, 0x55, 0x01])
      const message = ReadCoilsResponse.fromBuffer(buffer)

      assert.equal(0x01, message.fc)
      assert.equal(0x02, message.numberOfBytes)
      assert.deepEqual([1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0], message.valuesAsArray)
      assert.deepEqual(Buffer.from([0x55, 0x01]), message.valuesAsBuffer)
    })
    it('should mask out extra bits', function () {
      const requestBody = ModbusRequestBody.fromBuffer(Buffer.from([0x01, 0x00, 0x00, 0x00, 0x09]))
      const coils = Buffer.from([0xff, 0xff])
      const response = ReadCoilsResponse.fromRequest(requestBody, coils)
      const buffer = response.createPayload()
      const expected = Buffer.from([0x01, 0x02, 0xff, 0x01])

      assert.deepEqual(expected, buffer)
    })
    it('should return an individual coil if requested', function () {
      const requestBody = ModbusRequestBody.fromBuffer(Buffer.from([0x01, 0x00, 0x00, 0x00, 0x01]))
      const coils = Buffer.from([0xff, 0xff])
      const response = ReadCoilsResponse.fromRequest(requestBody, coils)
      const buffer = response.createPayload()
      const expected = Buffer.from([0x01, 0x01, 0x01])

      assert.deepEqual(expected, buffer)
    })
    it('should return null on not enough buffer data', function () {
      const buffer = Buffer.from([0x01])
      const message = ReadCoilsResponse.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      const buffer = Buffer.from([0x02, 0x03, 0x0a, 0x00, 0x0c])
      const message = ReadCoilsResponse.fromBuffer(buffer)

      assert.ok(message === null)
    })

    it('should return <55> when addres = 0 and count = 8 for coils <55 55 55>', function () {
      const coils = Buffer.from([0x55, 0x55, 0x55])
      const requestBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x01, // unit id
        0x01, // function code
        0x00, 0x00, // starting address
        0x00, 0x08 // quantity
      ])
      const request = ModbusTCPRequest.fromBuffer(requestBuffer)
      const responseBody = ReadCoilsResponse.fromRequest(request.body, coils)
      const response = ModbusTCPResponse.fromRequest(request, responseBody)
      const payload = response.createPayload()
      const responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x04, // byte count
        0x01, // unit id
        0x01, // function code
        0x01, // byte count
        0x55 // coils
      ])

      assert.deepEqual(payload, responseBuffer)
    })
    it('should return <55> when addres = 6 and count = 8 for coils <55 55 55>', function () {
      const coils = Buffer.from([0x55, 0x55, 0x55])
      const requestBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x01, // unit id
        0x01, // function code
        0x00, 0x06, // starting address
        0x00, 0x08 // quantity
      ])
      const request = ModbusTCPRequest.fromBuffer(requestBuffer)
      const responseBody = ReadCoilsResponse.fromRequest(request.body, coils)
      const response = ModbusTCPResponse.fromRequest(request, responseBody)
      const payload = response.createPayload()
      const responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x04, // byte count
        0x01, // unit id
        0x01, // function code
        0x01, // byte count
        0x55 // coils
      ])

      assert.deepEqual(payload, responseBuffer)
    })
    it('should return <55 01> when addres = 0 and count = 9 for coils <55 55 55>', function () {
      const coils = Buffer.from([0x55, 0x55, 0x55])
      const requestBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x01, // unit id
        0x01, // function code
        0x00, 0x00, // starting address
        0x00, 0x09 // quantity
      ])
      const request = ModbusTCPRequest.fromBuffer(requestBuffer)
      const responseBody = ReadCoilsResponse.fromRequest(request.body, coils)
      const response = ModbusTCPResponse.fromRequest(request, responseBody)
      const payload = response.createPayload()
      const responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x05, // byte count
        0x01, // unit id
        0x01, // function code
        0x02, // byte count
        0x55, 0x01 // coils
      ])

      assert.deepEqual(payload, responseBuffer)
    })
    it('should return <2A> when addres = 1 and count = 7 for coils <55 55 55>', function () {
      const coils = Buffer.from([0x55, 0x55, 0x55])
      const requestBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x01, // unit id
        0x01, // function code
        0x00, 0x01, // starting address
        0x00, 0x07 // quantity
      ])
      const request = ModbusTCPRequest.fromBuffer(requestBuffer)
      const responseBody = ReadCoilsResponse.fromRequest(request.body, coils)
      const response = ModbusTCPResponse.fromRequest(request, responseBody)
      const payload = response.createPayload()
      const responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x04, // byte count
        0x01, // unit id
        0x01, // function code
        0x01, // bit count
        0x2a // coils
      ])

      assert.deepEqual(payload, responseBuffer)
    })
    it('should return <05> when addres = 0 and count = 4 for coils <55 55 55>', function () {
      const coils = Buffer.from([0x55, 0x55, 0x55])
      const requestBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x01, // unit id
        0x01, // function code
        0x00, 0x00, // starting address
        0x00, 0x04 // quantity
      ])
      const request = ModbusTCPRequest.fromBuffer(requestBuffer)
      const responseBody = ReadCoilsResponse.fromRequest(request.body, coils)
      const response = ModbusTCPResponse.fromRequest(request, responseBody)
      const payload = response.createPayload()
      const responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x04, // byte count
        0x01, // unit id
        0x01, // function code
        0x01, // byte count
        0x05 // coils
      ])

      assert.deepEqual(payload, responseBuffer)
    })
    it('should return <02> when addres = 1 and count = 3 for coils <55 55 55>', function () {
      const coils = Buffer.from([0x55, 0x55, 0x55])
      const requestBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x01, // unit id
        0x01, // function code
        0x00, 0x01, // starting address
        0x00, 0x03 // quantity
      ])
      const request = ModbusTCPRequest.fromBuffer(requestBuffer)
      const responseBody = ReadCoilsResponse.fromRequest(request.body, coils)
      const response = ModbusTCPResponse.fromRequest(request, responseBody)
      const payload = response.createPayload()
      const responseBuffer = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x04, // byte count
        0x01, // unit id
        0x01, // function code
        0x01, // byte count
        0x02 // coils
      ])

      assert.deepEqual(payload, responseBuffer)
    })
  })

  describe('ReadCoils Requests', function () {
    it('should create a buffer from a read coils message', function () {
      const readCoilsRequest = new ReadCoilsRequest(10, 12)
      const buffer = readCoilsRequest.createPayload()
      const expected = Buffer.from([0x01, 0x00, 0x0a, 0x00, 0x0c])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message object from a buffer', function () {
      const buffer = Buffer.from([0x01, 0x00, 0x0a, 0x00, 0x0c])
      const message = ReadCoilsRequest.fromBuffer(buffer)

      assert.equal(0x01, message.fc)
      assert.equal(10, message.start)
      assert.equal(12, message.count)
    })
    it('should return null on not enough buffer data', function () {
      const buffer = Buffer.from([0x01, 0x00])
      const message = ReadCoilsRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      const buffer = Buffer.from([0x02, 0x00, 0x0a, 0x00, 0x0c])
      const message = ReadCoilsRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
})
