'use strict'

var stampit = require('stampit')

module.exports = stampit()
  .init(function () {
    var init = function () {
      this.log.debug('initiating write single register request handler.')

      if (!this.responseDelay) {
        this.responseDelay = 0
      }

      this.setRequestHandler(6, onRequest)
    }.bind(this)

    var onRequest = function (pdu, cb) {
      setTimeout(function () {
        this.log.debug('handling write single register request.')

        if (pdu.length !== 5) {
          let buf = Buffer.allocUnsafe(2)

          buf.writeUInt8(0x86, 0)
          buf.writeUInt8(0x02, 1)
          cb(buf)
          return
        }

        var address = pdu.readUInt16BE(1)
        var byteAddress = address * 2
        var value = pdu.readUInt16BE(3)

        this.emit('preWriteSingleRegisterRequest', byteAddress, value)

        var mem = this.getHolding()

        if (byteAddress > mem.length) {
          let buf = Buffer.allocUnsafe(2)

          buf.writeUInt8(0x86, 0)
          buf.writeUInt8(0x02, 1)
          cb(buf)
          return
        }

        var response = Buffer.allocUnsafe(5)

        response.writeUInt8(0x06)
        response.writeUInt16BE(address, 1)
        response.writeUInt16BE(value, 3)

        mem.writeUInt16BE(value, byteAddress)

        this.emit('postWriteSingleRegisterRequest', byteAddress, value)

        cb(response)
      }.bind(this), this.responseDelay)
    }.bind(this)

    init()
  })
