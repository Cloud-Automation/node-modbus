/* global describe, it, beforeEach */
'use strict'

const assert = require('assert')
const Modbus = require('../')
const EventEmitter = require('events')

describe('TCP Server Tests.', function () {
  let socket, server

  beforeEach(function () {
    socket = new EventEmitter()
    socket.write = (response) => {}

    server = new Modbus.server.TCP(socket, {
      holding: Buffer.alloc(12, 0x00),
      input: Buffer.alloc(12, 0x00),
      coils: Buffer.from([0x55, 0x55, 0x55]),
      discrete: Buffer.from([0xAA, 0xAA, 0xAA])
    })
  })

  describe('Write Single Coil Tests.', function () {
    it('should force a coil in the server buffer at address 1', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02, // unit id
        0x05, // function code
        0x00, 0x01, // address
        0xFF, 0x00 // value
      ])
      const expectedCoils = Buffer.from([0x57, 0x55, 0x55])

      socket.write = (response) => {
        assert.deepEqual(request, response)
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })
    it('should force a coil in the server buffer at address 8', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02, // unit id
        0x05, // function code
        0x00, 0x08, // output address
        0x00, 0x00 // output value
      ])
      const expectedCoils = Buffer.from([0x55, 0x54, 0x55])

      socket.write = (response) => {
        assert.deepEqual(request, response)
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })
  })

  describe('Write Multiple Coils Tests.', function () {
    it('should write <0F> in the server buffer coils at address 0', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x08, // byte count
        0x02, // unit id
        0x0F, // function code
        0x00, 0x00, // address
        0x00, 0x04, // quantity
        0x01, // byte count
        0x0F // values
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02, // unit id
        0x0F, // function code
        0x00, 0x00, // address
        0x00, 0x04 // quantity
      ])
      const expectedCoils = Buffer.from([0x5F, 0x55, 0x55])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })
    it('should write <FF> in the server buffer coils at address 0', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x08, // byte count
        0x02, // unit id
        0x0F, // function code
        0x00, 0x00, // address
        0x00, 0x08, // quantity
        0x01, // byte count
        0xFF // values
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02, // unit id
        0x0F, // function code
        0x00, 0x00, // address
        0x00, 0x08 // quantity
      ])
      const expectedCoils = Buffer.from([0xFF, 0x55, 0x55])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })
    it('should write <FF 01> in the server buffer coils at address 0', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x09, // byte count
        0x02, // unit id
        0x0F, // function code
        0x00, 0x00, // address
        0x00, 0x09, // quantity
        0x02, // byte count
        0xFF, 0x01 // values
      ])
      const expectedCoils = Buffer.from([0xFF, 0x55, 0x55])

      socket.write = (response) => {
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }
      socket.emit('connection', socket)
      socket.emit('data', request)
    })
    it('should write <0F> in the server buffer coils at address 6', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x08, // byte count
        0x02, // unit id
        0x0F, // function code
        0x00, 0x06, // address
        0x00, 0x04, // quantity
        0x01, // byte count
        0x0F // values
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02, // unit id
        0x0F, // function code
        0x00, 0x06, // address
        0x00, 0x04 // quantity
      ])
      const expectedCoils = Buffer.from([0xD5, 0x57, 0x55])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })
    it('should write <0F> in the server buffer coils at address 8', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x08, // byte count
        0x02, // unit id
        0x0F, // function code
        0x00, 0x08, // address
        0x00, 0x04, // quantity
        0x01, // byte count
        0x0F // values
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02, // unit id
        0x0F, // function code
        0x00, 0x08, // address
        0x00, 0x04 // quantity
      ])
      const expectedCoils = Buffer.from([0x55, 0x5F, 0x55])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedCoils, server.coils)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })
  })

  describe('Write Multiple Registers Tests.', function () {
    it('should write <D903> in the server buffer at address 0', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x09, // byte count
        0x02, // unit id
        0x10, // function code
        0x00, 0x00, // address
        0x00, 0x01, // quantity
        0x02, // byte count
        0xD9, 0x03 // values
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02, // unit id
        0x10, // function code
        0x00, 0x00, // address
        0x00, 0x01 // quantity
      ])
      const expectedHolding = Buffer.alloc(12, 0x00)
      expectedHolding.writeUInt16BE(0xD903, 0)

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedHolding, server.holding)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })
    it('should write <D903 D903> in the server buffer at address 0', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x0B, // byte count
        0x02, // unit id
        0x10, // function code
        0x00, 0x00, // address
        0x00, 0x02, // quantity
        0x04, // byte count
        0xD9, 0x03, // values
        0xD9, 0x03 // values
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02, // unit id
        0x10, // function code
        0x00, 0x00, // address
        0x00, 0x02 // quantity
      ])
      const expectedHolding = Buffer.alloc(12, 0x00)
      expectedHolding.writeUInt16BE(0xD903, 0)
      expectedHolding.writeUInt16BE(0xD903, 2)

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedHolding, server.holding)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })
    it('should write <D903 D903> in the server buffer at address 4', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x0B, // byte count
        0x02, // unit id
        0x10, // function code
        0x00, 0x04, // address
        0x00, 0x02, // quantity
        0x04, // byte count
        0xD9, 0x03, // values
        0xD9, 0x03 // values
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02, // unit id
        0x10, // function code
        0x00, 0x04, // address
        0x00, 0x02 // quantity
      ])
      const expectedHolding = Buffer.alloc(12, 0x00)
      expectedHolding.writeUInt16BE(0xD903, 8)
      expectedHolding.writeUInt16BE(0xD903, 10)

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        assert.deepEqual(expectedHolding, server.holding)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })
  })

  describe('Read Request Quantity Validation Tests.', function () {
    it('should return exception 0x03 for FC01 read coils with quantity of 0', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x01,       // function code
        0x00, 0x00, // starting address
        0x00, 0x00  // quantity 0 (below minimum of 1)
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x03, // byte count
        0x02,       // unit id
        0x81,       // exception for FC01
        0x03        // ILLEGAL DATA VALUE
      ])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })

    it('should return exception 0x03 for FC02 read discrete inputs with quantity of 0', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x02,       // function code
        0x00, 0x00, // starting address
        0x00, 0x00  // quantity 0 (below minimum of 1)
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x03, // byte count
        0x02,       // unit id
        0x82,       // exception for FC02
        0x03        // ILLEGAL DATA VALUE
      ])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })

    it('should return exception 0x03 for FC03 read holding registers with quantity > 125', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x03,       // function code
        0x00, 0x00, // starting address
        0x00, 0x7E  // quantity 126 (exceeds 125 limit)
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x03, // byte count
        0x02,       // unit id
        0x83,       // exception for FC03
        0x03        // ILLEGAL DATA VALUE
      ])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })

    it('should return exception 0x03 for FC04 read input registers with quantity > 125', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x04,       // function code
        0x00, 0x00, // starting address
        0x00, 0x7E  // quantity 126 (exceeds 125 limit)
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x03, // byte count
        0x02,       // unit id
        0x84,       // exception for FC04
        0x03        // ILLEGAL DATA VALUE
      ])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })

    it('should return exception 0x03 for FC03 with quantity of 0', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x03,       // function code
        0x00, 0x00, // starting address
        0x00, 0x00  // quantity 0 (below minimum of 1)
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x03, // byte count
        0x02,       // unit id
        0x83,       // exception for FC03
        0x03        // ILLEGAL DATA VALUE
      ])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })

    it('should return exception 0x02 for FC03 when start + count exceeds holding buffer', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x03,       // function code
        0x00, 0x04, // starting address 4
        0x00, 0x04  // quantity 4 (address 4 + 4 = 8 registers = 16 bytes > 12 byte buffer)
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x03, // byte count
        0x02,       // unit id
        0x83,       // exception for FC03
        0x02        // ILLEGAL DATA ADDRESS
      ])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })

    it('should return exception 0x02 for FC04 when start + count exceeds input buffer', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x04,       // function code
        0x00, 0x04, // starting address 4
        0x00, 0x04  // quantity 4 (address 4 + 4 = 8 registers = 16 bytes > 12 byte buffer)
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x03, // byte count
        0x02,       // unit id
        0x84,       // exception for FC04
        0x02        // ILLEGAL DATA ADDRESS
      ])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })

    it('should not crash when FC03 quantity would overflow byte count (DoS regression)', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x03,       // function code
        0x05, 0x39, // starting address 1337
        0x02, 0x69  // quantity 617 (byte count 1234 overflows UInt8)
      ])
      const expectedResponse = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x03, // byte count
        0x02,       // unit id
        0x83,       // exception for FC03
        0x03        // ILLEGAL DATA VALUE
      ])

      socket.write = (response) => {
        assert.deepEqual(expectedResponse, response)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })

    it('should accept FC03 read holding registers at max valid quantity for buffer', function (done) {
      const request = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x03,       // function code
        0x00, 0x00, // starting address 0
        0x00, 0x06  // quantity 6 (exactly fills 12-byte holding buffer)
      ])

      socket.write = (response) => {
        assert.equal(response.readUInt8(7), 0x03)
        done()
      }

      socket.emit('connection', socket)
      socket.emit('data', request)
    })
  })
})
