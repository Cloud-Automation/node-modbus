'use strict'

var stampit = require('stampit')

module.exports = stampit()
  .init(function () {
    var init = function () {
      this.log.debug('initiating write multiple registers request handler.')

      if (!this.responseDelay) {
        this.responseDelay = 0
      }

      this.setRequestHandler(16, onRequest)
    }.bind(this)

    var onRequest = function (pdu, cb) {
      setTimeout(function () {
        this.log.debug('handling write multiple registers request.')

        if (pdu.length < 3) {
          let buf = Buffer.allocUnsafe(2)

          buf.writeUInt8(0x90, 0)
          buf.writeUInt8(0x02, 1)
          cb(buf)
          return
        }

        var start = pdu.readUInt16BE(1)
        var byteStart = start * 2
        var quantity = pdu.readUInt16BE(3)
        var byteCount = pdu.readUInt8(5)

        if (quantity > 0x007b) {
          let buf = Buffer.allocUnsafe(2)

          buf.writeUInt8(0x90, 0)
          buf.writeUInt8(0x03, 1)
          cb(buf)
          return
        }

        this.emit('preWriteMultipleRegistersRequest', byteStart, quantity, byteCount)

        var mem = this.getHolding()

        if (byteStart > mem.length || byteStart + (quantity * 2) > mem.length) {
          var buf = Buffer.allocUnsafe(2)

          buf.writeUInt8(0x90, 0)
          buf.writeUInt8(0x02, 1)
          cb(buf)
          return
        }

        var response = Buffer.allocUnsafe(5)
        response.writeUInt8(0x10, 0)
        response.writeUInt16BE(start, 1)
        response.writeUInt16BE(quantity, 3)

        pdu.copy(mem, byteStart, 6, 6 + byteCount)

        this.emit('postWriteMultipleRegistersRequest', byteStart, quantity, byteCount)

        cb(response)
      }.bind(this), this.responseDelay)
    }.bind(this)

    init()
  })
