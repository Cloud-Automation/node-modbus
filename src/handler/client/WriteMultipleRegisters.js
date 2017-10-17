'use strict'

var stampit = require('stampit')
var Promise = require('bluebird')

module.exports = stampit()
  .init(function () {
    var init = function () {
      this.addResponseHandler(16, onResponse)
    }.bind(this)

    var onResponse = function (pdu, request) {
      this.log.debug('handling multiple registers response.')

      var fc = pdu.readUInt8(0)
      var startAddress = pdu.readUInt16BE(1)
      var quantity = pdu.readUInt16BE(3)

      var resp = {
        fc: fc,
        startAddress: startAddress,
        quantity: quantity
      }

      if (fc !== 16) {
        request.defer.reject(new Error('received unexpected function code'))
        return
      }

      request.defer.resolve(resp)
    }.bind(this)

    this.writeMultipleRegisters = function (startAddress, register) {
      return new Promise(function (resolve, reject) {
        var fc = 16
        var basePdu = Buffer.allocUnsafe(6)
        var pdu

        basePdu.writeUInt8(fc)
        basePdu.writeUInt16BE(startAddress, 1)

        if (register instanceof Buffer) {
          if (register.length / 2 > 0x007b) {
            reject()
          }

          basePdu.writeUInt16BE(register.length / 2, 3)
          basePdu.writeUInt8(register.length, 5)

          pdu = Buffer.concat([basePdu, register])
        } else if (register instanceof Array) {
          if (register.length > 0x007b) {
            reject()
            return
          }

          var byteCount = Math.ceil(register.length * 2)
          var payloadPdu = Buffer.allocUnsafe(byteCount)

          basePdu.writeUInt16BE(register.length, 3)
          basePdu.writeUInt8(byteCount, 5)

          for (var i = 0; i < register.length; i += 1) {
            payloadPdu.writeUInt16BE(register[i], 2 * i)
          }

          pdu = Buffer.concat([basePdu, payloadPdu])
        } else {
          reject()
          return
        }

        this.queueRequest(fc, pdu, { resolve: resolve, reject: reject })
      }.bind(this))
    }

    init()
  })
