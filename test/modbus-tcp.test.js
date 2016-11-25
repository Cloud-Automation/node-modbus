/* global describe, it */
'use strict'
var assert = require('assert')
var EventEmitter = require('events')

describe('Modbus TCP Tests.', function () {
  describe('Chopped Data Tests (Server Side).', function () {
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
})
