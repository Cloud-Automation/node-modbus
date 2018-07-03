/* global describe, it, beforeEach */
'use strict'

let assert = require('assert')
let Modbus = require('../')
let EventEmitter = require('events')

describe('RTU Server Tests.', function () {
  let socket, server

  beforeEach(function () {
    socket = new EventEmitter()
    socket.write = (response) => {}

    server = new Modbus.server.RTU(socket, {
      holding: Buffer.alloc(12, 0x00),
      coils: Buffer.from([0x55, 0x55, 0x55])
    })
  })

  describe('Request data integrity checking', function () {
    it('should ignore request messages with unexpected CRC values', function () {
      const request = Buffer.from([
        0x02, // address
        0x0F, // function code
        0x00, 0x00, // address
        0x00, 0x04, // quantity
        0x01, // byte count
        0x0F, // values
        0xFF, 0xFF // CRC
      ])

      socket.write = (response) => {
        // No response expected
        assert(false)
      }

      socket.emit('data', request)
    })
  })

  describe('Write Single Coil Tests.', function () {
    it('should force a coil in the server buffer at address 1', function (done) {
      const request = Buffer.from([
        0x02, // address
        0x05, // function code
        0x00, 0x01, // address
        0xFF, 0x00, // value
        0xDD, 0xC9  // CRC
      ])
      const expectedCoils = Buffer.from([0x57, 0x55, 0x55])

      socket.write = (response) => {
        assert.deepEqual(request, response)
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }

      socket.emit('data', request)
    })
    it('should force a coil in the server buffer at address 8', function (done) {
      const request = Buffer.from([
        0x02, // address
        0x05, // function code
        0x00, 0x08, // output address
        0x00, 0x00, // output value
        0x4C, 0x3B // CRC
      ])
      const expectedCoils = Buffer.from([0x55, 0x54, 0x55])

      socket.write = (response) => {
        assert.deepEqual(request, response)
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }

      socket.emit('data', request)
    })
  })

  describe('Write Multiple Coils Tests.', function () {
    it('should write <0F> in the server buffer coils at address 0', function (done) {
      const request = Buffer.from([
        0x02, // address
        0x0F, // function code
        0x00, 0x00, // address
        0x00, 0x04, // quantity
        0x01, // byte count
        0x0F, // values
        0x3E, 0x87 // CRC
      ])
      const expectedResponse = Buffer.from([
        0x02, // address
        0x0F, // function code
        0x00, 0x00, // address
        0x00, 0x04, // quantity
        0x54, 0x3B  // CRC
      ])
      const expectedCoils = Buffer.from([0x5F, 0x55, 0x55])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }

      socket.emit('data', request)
    })
    it('should write <FF> in the server buffer coils at address 0', function (done) {
      const request = Buffer.from([
        0x02, // address
        0x0F, // function code
        0x00, 0x00, // address
        0x00, 0x08, // quantity
        0x01, // byte count
        0xFF, // values
        0xFE, 0xC0 // CRC
      ])
      const expectedResponse = Buffer.from([
        0x02, // address
        0x0F, // function code
        0x00, 0x00, // address
        0x00, 0x08, // quantity
        0x54, 0x3E // CRC
      ])
      const expectedCoils = Buffer.from([0xFF, 0x55, 0x55])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }

      socket.emit('data', request)
    })
    it('should write <FF 01> in the server buffer coils at address 0', function (done) {
      const request = Buffer.from([
        0x02, // address
        0x0F, // function code
        0x00, 0x00, // address
        0x00, 0x09, // quantity
        0x02, // byte count
        0xFF, 0x01, // values
        0x71, 0xBC // CRC
      ])
      const expectedCoils = Buffer.from([0xFF, 0x55, 0x55])

      socket.write = (response) => {
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }
      socket.emit('data', request)
    })
    it('should write <0F> in the server buffer coils at address 6', function (done) {
      const request = Buffer.from([
        0x02, // address
        0x0F, // function code
        0x00, 0x06, // address
        0x00, 0x04, // quantity
        0x01, // byte count
        0x0F, // values
        0xB6, 0x87 // CRC
      ])
      const expectedResponse = Buffer.from([
        0x02, // address
        0x0F, // function code
        0x00, 0x06, // address
        0x00, 0x04, // quantity
        0xB4, 0x3A // CRC
      ])
      const expectedCoils = Buffer.from([0xD5, 0x57, 0x55])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }

      socket.emit('data', request)
    })
    it('should write <0F> in the server buffer coils at address 8', function (done) {
      const request = Buffer.from([
        0x02, // address
        0x0F, // function code
        0x00, 0x08, // address
        0x00, 0x04, // quantity
        0x01, // byte count
        0x0F, // values
        0xDF, 0x46 // CRC
      ])
      const expectedResponse = Buffer.from([
        0x02, // address
        0x0F, // function code
        0x00, 0x08, // address
        0x00, 0x04, // quantity
        0xD5, 0xF9 // CRC
      ])
      const expectedCoils = Buffer.from([0x55, 0x5F, 0x55])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }

      socket.emit('data', request)
    })
  })

  describe('Write Multiple Registers Tests.', function () {
    it('should write <D903> in the server buffer at address 0', function (done) {
      const request = Buffer.from([
        0x02, // address
        0x10, // function code
        0x00, 0x00, // address
        0x00, 0x01, // quantity
        0x02, // byte count
        0xD9, 0x03, // values
        0xA9, 0x31 // CRC
      ])
      const expectedResponse = Buffer.from([
        0x02, // address
        0x10, // function code
        0x00, 0x00, // address
        0x00, 0x01, // quantity
        0x01, 0xFA // CRC
      ])
      const expectedHolding = Buffer.alloc(12, 0x00)
      expectedHolding.writeUInt16BE(0xD903, 0)

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedHolding, server.holding)
        done()
      }

      socket.emit('data', request)
    })
    it('should write <D903 D903> in the server buffer at address 0', function (done) {
      const request = Buffer.from([
        0x02, // address
        0x10, // function code
        0x00, 0x00, // address
        0x00, 0x02, // quantity
        0x04, // byte count
        0xD9, 0x03, // values
        0xD9, 0x03, // values
        0x2C, 0x26 // CRC
      ])
      const expectedResponse = Buffer.from([
        0x02, // address
        0x10, // function code
        0x00, 0x00, // address
        0x00, 0x02, // quantity
        0x41, 0xFB // CRC
      ])
      const expectedHolding = Buffer.alloc(12, 0x00)
      expectedHolding.writeUInt16BE(0xD903, 0)
      expectedHolding.writeUInt16BE(0xD903, 2)

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedHolding, server.holding)
        done()
      }

      socket.emit('data', request)
    })
    it('should write <D903 D903> in the server buffer at address 4', function (done) {
      const request = Buffer.from([
        0x02, // address
        0x10, // function code
        0x00, 0x04, // address
        0x00, 0x02, // quantity
        0x04, // byte count
        0xD9, 0x03, // values
        0xD9, 0x03, // values
        0x2D, 0xD5 // CRC
      ])
      const expectedResponse = Buffer.from([
        0x02, // address
        0x10, // function code
        0x00, 0x04, // address
        0x00, 0x02, // quantity
        0x00, 0x3A // CRC
      ])
      const expectedHolding = Buffer.alloc(12, 0x00)
      expectedHolding.writeUInt16BE(0xD903, 8)
      expectedHolding.writeUInt16BE(0xD903, 10)

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedHolding, server.holding)
        done()
      }

      socket.emit('data', request)
    })
  })
})
