'use strict'

var stampit = require('stampit')

module.exports = stampit()
  .init(function () {
    var init = function () {
      this.log.debug('initiating write single coil request handler.')

      if (!this.responseDelay) {
        this.responseDelay = 0
      }

      this.setRequestHandler(5, onRequest)
    }.bind(this)

    var onRequest = function (pdu, cb) {
      setTimeout(function () {
        this.log.debug('handling write single coil request.')

        if (pdu.length !== 5) {
          let buf = Buffer.allocUnsafe(2)

          buf.writeUInt8(0x85, 0)
          buf.writeUInt8(0x02, 1)
          cb(buf)
          return
        }

        var address = pdu.readUInt16BE(1)
        var value = !(pdu.readUInt16BE(3) === 0x0000)

        if (pdu.readUInt16BE(3) !== 0x0000 && pdu.readUInt16BE(3) !== 0xFF00) {
          let buf = Buffer.allocUnsafe(2)

          buf.writeUInt8(0x85, 0)
          buf.writeUInt8(0x03, 1)
          cb(buf)
          return
        }

        this.emit('preWriteSingleCoilRequest', address, value)

        var mem = this.getCoils()

        if (address > mem.length * 8) {
          var buf = Buffer.allocUnsafe(2)

          buf.writeUInt8(0x85, 0)
          buf.writeUInt8(0x02, 1)
          cb(buf)
          return
        }

        var response = Buffer.allocUnsafe(5)

        response.writeUInt8(5, 0)
        response.writeUInt16BE(address, 1)
        response.writeUInt16BE(value ? 0xFF00 : 0x0000, 3)

        var oldValue = mem.readUInt8(Math.floor(address / 8))
        var newValue

        if (value) {
          newValue = oldValue | Math.pow(2, address % 8)
        } else {
          newValue = oldValue & ~Math.pow(2, address % 8)
        }

        mem.writeUInt8(newValue, Math.floor(address / 8))

        this.emit('postWriteSingleCoilRequest', address, value)

        cb(response)
      }.bind(this), this.responseDelay)
    }.bind(this)

    init()
  })
