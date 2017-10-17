'use strict'

var Stampit = require('stampit')
var Promise = require('bluebird')

module.exports = Stampit()
  .init(function () {
    var init = function () {
      this.addResponseHandler(2, onResponse)
    }.bind(this)

    var onResponse = function (pdu, request) {
      this.log.debug('handling read discrete inputs response.')

      var fc = pdu.readUInt8(0)
      var byteCount = pdu.readUInt8(1)
      var cntr = 0
      var resp = {
        fc: fc,
        byteCount: byteCount,
        payload: pdu.slice(2),
        coils: []
      }

      if (fc !== 2) {
        request.defer.reject(new Error('received unexpected function code'))
        return
      }

      for (var i = 0; i < byteCount; i += 1) {
        var h = 1
        var cur = pdu.readUInt8(2 + i)
        for (var j = 0; j < 8; j += 1) {
          resp.coils[cntr] = (cur & h) > 0
          h = h << 1
          cntr += 1
        }
      }

      request.defer.resolve(resp)
    }.bind(this)

    this.readDiscreteInputs = function (start, quantity) {
      return new Promise(function (resolve, reject) {
        var fc = 2
        var pdu = Buffer.allocUnsafe(5)

        pdu.writeUInt8(fc)
        pdu.writeUInt16BE(start, 1)
        pdu.writeUInt16BE(quantity, 3)

        if (quantity > 2000) {
          reject()
          return
        }

        this.queueRequest(fc, pdu, { resolve: resolve, reject: reject })
      }.bind(this))
    }

    init()
  })
