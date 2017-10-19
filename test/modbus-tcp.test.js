/* global describe, it */
'use strict'
var assert = require('assert')
var EventEmitter = require('events')
var sinon = require('sinon')

describe('Modbus TCP Tests.', function () {
  describe('Server Tests.', function () {
        /* We are using the read coils request for the chopped data tests. */

    let ClientSocket = require('../src/modbus-tcp-server-client.js')

    it('should handle a chopped data request fine.', function (done) {
      var em = new EventEmitter()
      var requests = [Buffer.from([0x00, 0x01]),  // Transaction Identifier
        Buffer.from([0x00, 0x00]), // Protocol
        Buffer.from([0x00, 0x05]), // Length
        Buffer.from([0x01]), // Unit identifier
        Buffer.from([0x01]), // PDU Function Code
        Buffer.from([0x00, 0x0A]), // Start Address
        Buffer.from([0x00, 0x15])] // Quantitiy

      var exRequest = {
        request: {
          trans_id: 1,
          protocol_ver: 0,
          unit_id: 1
        },
        pdu: Buffer.from([0x01, 0x00, 0x0A, 0x00, 0x15]),
        socket: em }

      var callbackCounter = 0
      var handler = function (req) {
        assert.deepEqual(req, exRequest)
        callbackCounter += 1
        assert.equal(callbackCounter, 1)
        done()
      }

      ClientSocket({
        socket: em,
        socketId: 1,
        onRequest: handler
      })

      requests.forEach(function (b) {
        em.emit('data', b)
      })
    })
  })

  describe('Client Tests.', function () {
    var stampit = require('stampit')
    var StateMachine = require('stampit-state-machine')
    var Logger = require('stampit-log')

    it('should handle a chopped data response fine.', function (done) {
      var ModbusTcpClient = require('../src/modbus-tcp-client.js')
      var injectedSocket = new EventEmitter()
      var exResponse = Buffer.from([0x01, 0x02, 0x055, 0x01])

      /* dummy method */
      injectedSocket.connect = function () { }

      /* create the client by composing
       * logger, state machine and the tcp client,
       * normally the logger and the state machine
       * come with the modbus client core. */
      var client = stampit()
        .compose(Logger)
        .compose(StateMachine)
        .compose(ModbusTcpClient)({
          injectedSocket: injectedSocket
        })

      /* connect to whatever and confirm */
      client.connect()

      injectedSocket.emit('connect')

      /* fetch send data and compare */
      client.on('data', function (data) {
        assert.equal(data.compare(exResponse), 0)
        done()
      })

      /* Send header data */
      injectedSocket.emit('data', Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x05, 0x01]))
      /* emitting a read coils response */
      injectedSocket.emit('data', Buffer.from([0x01, 0x02, 0x55, 0x01]))
    })

    it('should send more than 2^16 msgs just fine', function () {
      var ModbusTcpClient = require('../src/modbus-tcp-client.js')
      var injectedSocket = {
        write: function () {},
        connect: function () {},
        on: function () {}
      }

      var client = stampit()
        .compose(StateMachine)
        .compose(Logger)
        .compose(ModbusTcpClient)({
          injectedSocket: injectedSocket
        })

      client.connect()

      for (let i = 0; i < 0x10000; i++) {
        client.emit('send', Buffer.allocUnsafe(5))
      }
    })

    it('should destroy socket and throw error when received request id is not as expected', function (done) {
      const ModbusTcpClient = require('../src/modbus.js').client.tcp.complete
      const injectedSocket = Object.assign(new EventEmitter(), {
        write: (data) => {
          const requestId = data.readUInt16BE(0)
          data.writeUInt16BE(requestId + 1, 0)
          injectedSocket.emit('data', data)
        },
        connect: () => {
          injectedSocket.emit('connect')
        },
        destroy: sinon.spy()
      })

      const client = stampit()
        .compose(ModbusTcpClient)({
          injectedSocket: injectedSocket
        })

      client.on('error', (err) => {
        assert(err.message.match(/out of sync/i))
        assert(err.message.match(/request/i))
        assert(injectedSocket.destroy.called)
        done()
      })

      client.connect()
      client.readHoldingRegisters(10, 0).then(() => assert.fail())
    })

    it('should destroy socket and throw error when received protocol id is not as expected', function (done) {
      const ModbusTcpClient = require('../src/modbus.js').client.tcp.complete
      const injectedSocket = Object.assign(new EventEmitter(), {
        write: (data) => {
          data.writeUInt16BE(0xffff, 2) // put invalid protocolId
          injectedSocket.emit('data', data)
        },
        connect: () => {
          injectedSocket.emit('connect')
        },
        destroy: sinon.spy()
      })

      const client = stampit()
        .compose(ModbusTcpClient)({
          injectedSocket: injectedSocket
        })

      client.on('error', (err) => {
        assert(err.message.match(/out of sync/i))
        assert(err.message.match(/protocol/i))
        assert(injectedSocket.destroy.called)
        done()
      })

      client.connect()
      client.readHoldingRegisters(10, 0).then(() => assert.fail())
    })
  })
})
