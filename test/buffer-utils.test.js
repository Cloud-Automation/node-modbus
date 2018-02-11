'use strict'

let assert = require('assert')
let bufferUtils = require('../src/buffer-utils.js')

describe('Buffer manipulation tests', function () {

  /* we are using the read coils function to test the modbus/tcp specifics */

  it('should return a short buffer', function () {
    let start_address = 3
    let end_address = 7
    let buffer = Buffer.from([0b00010001])
    let expectedBuffer = Buffer.from([0b01000100])
    let buf = bufferUtils.bufferShift(start_address, end_address, buffer)

    assert(expectedBuffer.equals(buf))
  })

  it('should return a longer buffer', function () {
    let start_address = 8
    let end_address = 17
    let buffer = Buffer.from([0b11111111, 0b00000011])
    let expectedBuffer = Buffer.from([0b10000000, 0b11111111, 0b00000001])
    let buf = bufferUtils.bufferShift(start_address, end_address, buffer)

    assert(expectedBuffer.equals(buf))
  })

  it('should return a correct only byte', function () {
    let start_address = 3
    let end_address = 7
    let buffer = Buffer.from([0b00010001])
    let buf = bufferUtils.bufferShift(start_address, end_address, buffer)
    let original_buffer = Buffer.from([0b10101010])
    let expected_byte = 0b01000110

    let firstByte = bufferUtils.firstByte(start_address, original_buffer[0], buf[0])

    assert.equal(firstByte, expected_byte)

    expected_byte = 0b11000110
    let lastByte = bufferUtils.lastByte(end_address, original_buffer[0], firstByte)

    assert.equal(lastByte, expected_byte)
  })

  it('should return a correct buffer', function () {
    let start_address = 10
    let end_address = 27
    let buffer = Buffer.from([0b10011001, 0b10011001, 0b00000001])
    let buf = bufferUtils.bufferShift(start_address, end_address, buffer)

    let original_buffer = Buffer.from([0b10101010, 0b10101010, 0b10101010, 0b10101010, 0b10101010])
    let expected_buffer = Buffer.from([0b10101010, 0b00110010, 0b00110011, 0b10101011, 0b10101010])

    let start_byte = Math.floor(start_address / 8)
    let firstByte = bufferUtils.firstByte(start_address, original_buffer[start_byte], buf[0])
    let expected_byte = 0b00110010
    assert.equal(firstByte, expected_byte)

    buf[0] = firstByte

    let last_byte = Math.floor(end_address / 8)
    let lastByte = bufferUtils.lastByte(end_address, original_buffer[original_buffer.length - 1], buf[buf.length - 1])
    expected_byte = 0b10101011
    assert.equal(lastByte, expected_byte)

    buf[buf.length - 1] = lastByte

    original_buffer.fill(buf, start_byte, last_byte + 1)

    assert(original_buffer.equals(expected_buffer))
  })

  it('should return another correct buffer', function () {
    let start_address = 13
    let end_address = 20
    let buffer = Buffer.from([0b11111111])
    let buf = bufferUtils.bufferShift(start_address, end_address, buffer)

    let original_buffer = Buffer.from([0b00000000, 0b00000000, 0b00000000, 0b00000000])
    let expected_buffer = Buffer.from([0b00000000, 0b11110000, 0b00001111, 0b00000000])

    let start_byte = Math.floor(start_address / 8)
    let firstByte = bufferUtils.firstByte(start_address, original_buffer[start_byte], buf[0])
    let expected_byte = 0b11110000
    assert.equal(firstByte, expected_byte)

    buf[0] = firstByte

    let last_byte = Math.floor(end_address / 8)
    let lastByte = bufferUtils.lastByte(end_address, original_buffer[original_buffer.length - 1], buf[buf.length - 1])
    expected_byte = 0b00001111
    assert.equal(lastByte, expected_byte)

    buf[buf.length - 1] = lastByte

    original_buffer.fill(buf, start_byte, last_byte + 1)

    assert(original_buffer.equals(expected_buffer))
  })

})
