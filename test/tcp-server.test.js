/* global describe, it, beforeEach */
'use strict'

let assert = require('assert')
let Modbus = require('../')
let EventEmitter = require('events')

describe('TCP Server Tests.', function () {
  let socket, server

  beforeEach(function () {
    socket = new EventEmitter()
    socket.write = (response) => {}

    server = new Modbus.server.TCP(socket, {
      holding: Buffer.alloc(12, 0x00),
      coils: Buffer.from([0x55, 0x55, 0x55])
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
})
