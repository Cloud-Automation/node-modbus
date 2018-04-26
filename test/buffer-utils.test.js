/* global describe, it */
'use strict'

let assert = require('assert')
let bufferUtils = require('../src/buffer-utils.js')

describe('Buffer and status conversions.', function () {
  it('should convert 10 coils status to buffer 2 bytes', function () {
    let input = [0, 0, 0, 0, 1, 0, 1, 0, 1, 0]
    let expected = Buffer.from([0x50, 0x01])
    let result = bufferUtils.arrayStatusToBuffer(input)

    assert.deepEqual(expected, result)
  })

  it('should convert a buffer with hex to coils/discrete array status', function () {
    let input = Buffer.from([0x50, 0x01])
    let expected = [0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0]
    let result = bufferUtils.bufferToArrayStatus(input)

    assert.deepEqual(expected, result)
  })

  it('should convert a buffer with bin to coils/discrete array status', function () {
    let input = Buffer.from([0b01010000, 0b00000001])
    let expected = [0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0]
    let result = bufferUtils.bufferToArrayStatus(input)

    assert.deepEqual(expected, result)
  })

  it('should return empty array if buffer is not instance of Buffer', function () {
    let expected = []

    let input = 0b0101000000000001
    let result = bufferUtils.bufferToArrayStatus(input)
    assert.deepEqual(expected, result)

    input = [0b01010000, 0b00000001]
    result = bufferUtils.bufferToArrayStatus(input)
    assert.deepEqual(expected, result)

    input = null
    result = bufferUtils.bufferToArrayStatus(input)
    assert.deepEqual(expected, result)
  })

  it('should return empty buffer if coils is not instance of Array', function () {
    let expected = Buffer.alloc(0)

    let input = 0b0101000000000001
    let result = bufferUtils.arrayStatusToBuffer(input)
    assert.deepEqual(expected, result)

    input = null
    result = bufferUtils.arrayStatusToBuffer(input)
    assert.deepEqual(expected, result)

    input = Buffer.from([0b01010000, 0b00000001])
    result = bufferUtils.arrayStatusToBuffer(input)
    assert.deepEqual(expected, result)
  })
})

describe('Buffer manipulation tests', function () {
  /* we are using the read coils function to test the modbus/tcp specifics */

  it('should return a short buffer', function () {
    let startAddress = 3
    let endAddress = 7
    let buffer = Buffer.from([0b00010001])
    let expectedBuffer = Buffer.from([0b01000100])
    let buf = bufferUtils.bufferShift(startAddress, endAddress, buffer)

    assert(expectedBuffer.equals(buf))
  })

  it('should return a longer buffer', function () {
    let startAddress = 8
    let endAddress = 17
    let buffer = Buffer.from([0b11111111, 0b00000011])
    let expectedBuffer = Buffer.from([0b10000000, 0b11111111, 0b00000001])
    let buf = bufferUtils.bufferShift(startAddress, endAddress, buffer)

    assert(expectedBuffer.equals(buf))
  })

  it('should return a correct only byte', function () {
    let startAddress = 3
    let endAddress = 7
    let buffer = Buffer.from([0b00010001])
    let buf = bufferUtils.bufferShift(startAddress, endAddress, buffer)
    let originalBuffer = Buffer.from([0b10101010])
    let expectedByte = 0b01000110

    let firstByte = bufferUtils.firstByte(startAddress, originalBuffer[0], buf[0])

    assert.equal(firstByte, expectedByte)

    expectedByte = 0b11000110
    let lastByte = bufferUtils.lastByte(endAddress, originalBuffer[0], firstByte)

    assert.equal(lastByte, expectedByte)
  })

  it('should return a correct buffer', function () {
    let startAddress = 10
    let endAddress = 27
    let buffer = Buffer.from([0b10011001, 0b10011001, 0b00000001])
    let buf = bufferUtils.bufferShift(startAddress, endAddress, buffer)

    let originalBuffer = Buffer.from([0b10101010, 0b10101010, 0b10101010, 0b10101010, 0b10101010])
    let expectedBuffer = Buffer.from([0b10101010, 0b00110010, 0b00110011, 0b10101011, 0b10101010])

    let startByte = Math.floor(startAddress / 8)
    let firstByte = bufferUtils.firstByte(startAddress, originalBuffer[startByte], buf[0])
    let expectedByte = 0b00110010
    assert.equal(firstByte, expectedByte)

    buf[0] = firstByte

    let lb = Math.floor(endAddress / 8)
    let lastByte = bufferUtils.lastByte(endAddress, originalBuffer[originalBuffer.length - 1], buf[buf.length - 1])
    expectedByte = 0b10101011
    assert.equal(lastByte, expectedByte)

    buf[buf.length - 1] = lastByte

    originalBuffer.fill(buf, startByte, lb + 1)

    assert(originalBuffer.equals(expectedBuffer))
  })

  it('should return another correct buffer', function () {
    let startAddress = 13
    let endAddress = 20
    let buffer = Buffer.from([0b11111111])
    let buf = bufferUtils.bufferShift(startAddress, endAddress, buffer)

    let originalBuffer = Buffer.from([0b00000000, 0b00000000, 0b00000000, 0b00000000])
    let expectedBuffer = Buffer.from([0b00000000, 0b11110000, 0b00001111, 0b00000000])

    let startByte = Math.floor(startAddress / 8)
    let firstByte = bufferUtils.firstByte(startAddress, originalBuffer[startByte], buf[0])
    let expectedByte = 0b11110000
    assert.equal(firstByte, expectedByte)

    buf[0] = firstByte

    let lb = Math.floor(endAddress / 8)
    let lastByte = bufferUtils.lastByte(endAddress, originalBuffer[originalBuffer.length - 1], buf[buf.length - 1])
    expectedByte = 0b00001111
    assert.equal(lastByte, expectedByte)

    buf[buf.length - 1] = lastByte

    originalBuffer.fill(buf, startByte, lb + 1)

    assert(originalBuffer.equals(expectedBuffer))
  })
})
