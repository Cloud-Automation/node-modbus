'use strict'

var stampit = require('stampit')
var Promise = require('bluebird')

module.exports = stampit()
  .init(function () {
    var init = function () {
      this.addResponseHandler(15, onResponse)
    }.bind(this)

    var onResponse = function (pdu, request) {
      this.log.debug('handling multiple coils response.')

      var fc = pdu.readUInt8(0)
      var startAddress = pdu.readUInt16BE(1)
      var quantity = pdu.readUInt16BE(3)

      var resp = {
        fc: fc,
        startAddress: startAddress,
        quantity: quantity
      }

      if (fc !== 15) {
        request.defer.reject(new Error('received unexpected function code'))
        return
      }

      request.defer.resolve(resp)
    }.bind(this)

    this.writeMultipleCoils = function (startAddress, coils, N) {
      return new Promise(function (resolve, reject) {
        var fc = 15
        var basePdu = Buffer.allocUnsafe(6)
        var pdu

        basePdu.writeUInt8(fc, 0)
        basePdu.writeUInt16BE(startAddress, 1)

        if (coils instanceof Buffer) {
          basePdu.writeUInt16BE(N, 3)
          basePdu.writeUInt8(coils.length, 5)
          pdu = Buffer.concat([basePdu, coils])
        } else if (coils instanceof Array) {
          if (coils.length > 1968) {
            reject()
            return
          }

          var byteCount = Math.ceil(coils.length / 8)
          var curByte = 0
          var curByteIdx = 0
          var cntr = 0
          var payloadPdu = Buffer.allocUnsafe(byteCount)

          basePdu.writeUInt16BE(coils.length, 3)
          basePdu.writeUInt8(byteCount, 5)

          for (var i = 0; i < coils.length; i += 1) {
            curByte += coils[i] ? Math.pow(2, cntr) : 0

            cntr = (cntr + 1) % 8

            if (cntr === 0 || i === coils.length - 1) {
              payloadPdu.writeUInt8(curByte, curByteIdx)
              curByteIdx = curByteIdx + 1
              curByte = 0
            }
          }

          pdu = Buffer.concat([basePdu, payloadPdu])
        }

        this.queueRequest(fc, pdu, { resolve: resolve, reject: reject })
      }.bind(this))
    }

    init()
  })
