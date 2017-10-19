'use strict'

var Stampit = require('stampit')
var Promise = require('bluebird')

module.exports = Stampit()
  .init(function () {
    var init = function () {
      this.addResponseHandler(6, onResponse)
    }.bind(this)

    var onResponse = function (pdu, request) {
      this.log.debug('handling write single register response.')

      var fc = pdu.readUInt8(0)
      var registerAddress = pdu.readUInt16BE(1)
      var registerValue = pdu.readUInt16BE(3)

      var resp = {
        fc: fc,
        registerAddress: registerAddress,
        registerValue: registerValue,
        registerAddressRaw: pdu.slice(1, 3),
        registerValueRaw: pdu.slice(3, 5)
      }

      if (fc !== 6) {
        request.defer.reject(new Error('received unexpected function code'))
        return
      }

      request.defer.resolve(resp)
    }.bind(this)

    this.writeSingleRegister = function (address, value) {
      return new Promise(function (resolve, reject) {
        var fc = 6
        var payload = (value instanceof Buffer) ? value.readUInt16BE(0) : value
        var pdu = Buffer.allocUnsafe(5)

        pdu.writeUInt8(fc, 0)
        pdu.writeUInt16BE(address, 1)
        pdu.writeUInt16BE(payload, 3)

        this.queueRequest(fc, pdu, { resolve: resolve, reject: reject })
      }.bind(this))
    }

    init()
  })
