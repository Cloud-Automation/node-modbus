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
  describe('ReadHoldingRegisters', function () {
    let ReadHoldingRegistersRequest = require('../src/request/read-holding-registers.js')
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
  describe('ReadInputRegisters', function () {
    let ReadInputRegistersRequest = require('../src/request/read-input-registers.js')
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
  describe('WriteSingleCoil', function () {
    let WriteSingleCoilRequest = require('../src/request/write-single-coil.js')
    it('should create a buffer from a write single coil message', function () {
      let request = new WriteSingleCoilRequest(10, true)
      let buffer = request.createPayload()
      let expected = Buffer.from([0x05, 0x00, 0x0a, 0xff, 0x00])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      let buffer = Buffer.from([0x05, 0x00, 0x0a, 0xff, 0x00])
      let message = WriteSingleCoilRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x05, message.fc)
      assert.equal(10, message.address)
      assert.equal(0xff00, message.value)
    })
    it('should return null on not enough buffer data', function () {
      let buffer = Buffer.from([0x05, 0x00])
      let message = WriteSingleCoilRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      let buffer = Buffer.from([0x06, 0x00, 0x0a, 0xff, 0x00])
      let message = WriteSingleCoilRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
  describe('WriteSingleRegister', function () {
    let WriteSingleRegisterRequest = require('../src/request/write-single-register.js')
    it('should create a buffer from a write single register message', function () {
      let request = new WriteSingleRegisterRequest(10, 0x1234)
      let buffer = request.createPayload()
      let expected = Buffer.from([0x06, 0x00, 0x0a, 0x12, 0x34])

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      let buffer = Buffer.from([0x06, 0x00, 0x0a, 0x12, 0x34])
      let message = WriteSingleRegisterRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x06, message.fc)
      assert.equal(10, message.address)
      assert.equal(0x1234, message.value)
    })
    it('should return null on not enough buffer data', function () {
      let buffer = Buffer.from([0x05, 0x00])
      let message = WriteSingleRegisterRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      let buffer = Buffer.from([0x07, 0x00, 0x0a, 0xff, 0x00])
      let message = WriteSingleRegisterRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
  describe('WriteMultipleCoils', function () {
    let WriteMultipleCoilsRequest = require('../src/request/write-multiple-coils.js')
    it('should create a buffer from a write multiple coils message', function () {
      let request = new WriteMultipleCoilsRequest(10, [1, 0, 1, 0, 0, 1, 0, 1, 1])
      let buffer = request.createPayload()
      let expected = Buffer.from([0x0F, 0x00, 0x0a, 0x00, 0x09, 0x02, 0xa5, 0x01])

      assert.ok(request !== null)
      assert.ok(request.numberOfBytes, 2)

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      let buffer = Buffer.from([0x0f, 0x00, 0x0a, 0x00, 0x09, 0x02, 0xa5, 0x01])
      let message = WriteMultipleCoilsRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x0f, message.fc)
      assert.equal(10, message.address)
      assert.equal(0x02, message.numberOfBytes)
      assert.deepEqual([1, 0, 1, 0, 0, 1, 0, 1, 1], message.valuesAsArray)
      assert.deepEqual(Buffer.from([0xa5, 0x01]), message.valuesAsBuffer)
    })
    it('should return null on not enough buffer data', function () {
      let buffer = Buffer.from([0x0f, 0x00])
      let message = WriteMultipleCoilsRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      let buffer = Buffer.from([0x10, 0x00, 0x0a, 0xff, 0x00])
      let message = WriteMultipleCoilsRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
  describe('WriteMultipleRegisters', function () {
    let WriteMultipleRegistersRequest = require('../src/request/write-multiple-registers.js')
    it('should create a buffer from a write multiple registers message', function () {
      let request = new WriteMultipleRegistersRequest(10, [0x0001, 0x0002, 0x1234, 0x4321])
      let buffer = request.createPayload()
      let expected = Buffer.from([0x10, 0x00, 0x0a, 0x00, 0x04, 0x08, 0x00, 0x01, 0x00, 0x02, 0x12, 0x34, 0x43, 0x21])

      assert.ok(request !== null)
      assert.ok(request.numberOfBytes, 8)

      assert.deepEqual(expected, buffer)
    })
    it('should create a message from a buffer', function () {
      let buffer = Buffer.from([0x10, 0x00, 0x0a, 0x00, 0x04, 0x08, 0x00, 0x01, 0x00, 0x02, 0x12, 0x34, 0x43, 0x21])
      let message = WriteMultipleRegistersRequest.fromBuffer(buffer)

      assert.ok(message !== null)
      assert.equal(0x10, message.fc)
      assert.equal(10, message.address)
      assert.equal(0x08, message.numberOfBytes)
      assert.deepEqual([0x0001, 0x0002, 0x1234, 0x4321], message.valuesAsArray)
      assert.deepEqual(Buffer.from([0x00, 0x01, 0x00, 0x02, 0x12, 0x34, 0x43, 0x21]), message.valuesAsBuffer)
    })
    it('should return null on not enough buffer data', function () {
      let buffer = Buffer.from([0x0f, 0x00])
      let message = WriteMultipleRegistersRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
    it('should return null on wrong function code', function () {
      let buffer = Buffer.from([0x11, 0x00, 0x0a, 0xff, 0x00])
      let message = WriteMultipleRegistersRequest.fromBuffer(buffer)

      assert.ok(message === null)
    })
  })
})
