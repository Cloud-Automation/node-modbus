'use strict'

var Stampit = require('stampit')
var Promise = require('bluebird')

module.exports = Stampit()
  .init(function () {
    var init = function () {
      this.addResponseHandler(3, onResponse)
    }.bind(this)

    var onResponse = function (pdu, request) {
      this.log.debug('handling read holding registers response.')

      var fc = pdu.readUInt8(0)
      var byteCount = pdu.readUInt8(1)

      var resp = {
        fc: fc,
        byteCount: byteCount,
        payload: pdu.slice(2),
        register: []
      }

      if (fc !== 3) {
        request.defer.reject(new Error('received unexpected function code'))
        return
      }

      var registerCount = byteCount / 2

      for (var i = 0; i < registerCount; i += 1) {
        resp.register.push(pdu.readUInt16BE(2 + (i * 2)))
      }

      request.defer.resolve(resp)
    }.bind(this)

    this.readHoldingRegisters = function (start, quantity) {
      return new Promise(function (resolve, reject) {
        this.log.debug('Starting read holding registers request.')

        var fc = 3
        var pdu = Buffer.allocUnsafe(5)

        pdu.writeUInt8(fc)
        pdu.writeUInt16BE(start, 1)
        pdu.writeUInt16BE(quantity, 3)

        this.queueRequest(fc, pdu, { resolve: resolve, reject: reject })
      }.bind(this))
    }

    init()
  })
