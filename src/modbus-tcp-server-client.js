'use strict'
var stampit = require('stampit')
var logger = require('stampit-log')

module.exports = stampit()
  .compose(logger)
  .init(function () {
    let buffer = Buffer.alloc(0)

    let init = function () {
      if (!this.socket || this.socketId === undefined || !this.onRequest) {
        throw new Error('No Socket defined.')
      }

      this.socket.on('end', this.onSocketEnd)
      this.socket.on('data', this.onSocketData)
      this.socket.on('error', this.onSocketError)
    }.bind(this)

    this.onSocketEnd = function () {
      if (this.onEnd) {
        this.onEnd()
      }

      this.log.debug('connection closed, socket', this.socketId)
    }.bind(this)

    this.onSocketData = function (data) {
      this.log.debug('received data socket', this.socketId, data.byteLength)

      buffer = Buffer.concat([buffer, data])

      while (buffer.length > 8) {
        // 1. extract mbap

        let len = buffer.readUInt16BE(4)
        let request = {
          trans_id: buffer.readUInt16BE(0),
          protocol_ver: buffer.readUInt16BE(2),
          unit_id: buffer.readUInt8(6)
        }

        // 2. extract pdu

        /* received data is not complete yet.
         * break loop and wait for more data. */

        if (buffer.length < 7 + len - 1) {
          break
        }

        let pdu = buffer.slice(7, 7 + len)

        // emit data event and let the
        // listener handle the pdu

        this.log.debug('PDU extracted.')

        this.onRequest({ request: request, pdu: pdu, socket: this.socket })

        buffer = buffer.slice(pdu.length + 7, buffer.length)
      }
    }.bind(this)

    this.onSocketError = function (e) {
      this.logError('Socker error', e)
    }.bind(this)

    init()
  })

