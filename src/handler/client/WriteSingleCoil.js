'use strict'

var Stampit = require('stampit')
var Promise = require('bluebird')

module.exports = Stampit()
  .init(function () {
    var init = function () {
      this.addResponseHandler(5, onResponse)
    }.bind(this)

    var onResponse = function (pdu, request) {
      this.log.debug('handling write single coil response.')

      var fc = pdu.readUInt8(0)
      var outputAddress = pdu.readUInt16BE(1)
      var outputValue = pdu.readUInt16BE(3)

      var resp = {
        fc: fc,
        outputAddress: outputAddress,
        outputValue: outputValue === 0x0000 ? false : outputValue === 0xFF00 ? true : undefined
      }

      if (fc !== 5) {
        request.defer.reject(new Error('received unexpected function code'))
        return
      }

      request.defer.resolve(resp)
    }.bind(this)

    this.writeSingleCoil = function (address, value) {
      return new Promise(function (resolve, reject) {
        var fc = 5
        var payload = (value instanceof Buffer) ? (value.readUInt8(0) > 0) : value
        var pdu = Buffer.allocUnsafe(5)

        pdu.writeUInt8(fc, 0)
        pdu.writeUInt16BE(address, 1)
        pdu.writeUInt16BE(payload ? 0xff00 : 0x0000, 3)

        this.queueRequest(fc, pdu, { resolve: resolve, reject: reject })
      }.bind(this))
    }

    init()
  })
