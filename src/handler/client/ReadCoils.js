var Stampit = require('stampit')
var Promise = require('bluebird')

module.exports = Stampit()
  .init(function () {
    var init = function () {
      this.addResponseHandler(1, onResponse)
    }.bind(this)

    var onResponse = function (pdu, request) {
      this.log.debug('handling read coils response.')

      var fc = pdu.readUInt8(0)
      var byteCount = pdu.readUInt8(1)

      var resp = {
        fc: fc,
        byteCount: byteCount,
        payload: pdu.slice(2),
        coils: []
      }

      if (fc !== 1) {
        request.defer.reject()
        return
      }

      let cntr = 0
      for (var i = 0; i < byteCount; i += 1) {
        let h = 1
        let cur = pdu.readUInt8(2 + i)
        for (var j = 0; j < 8; j += 1) {
          resp.coils[cntr] = (cur & h) > 0
          h = h << 1
          cntr += 1
        }
      }

      request.defer.resolve(resp)
    }.bind(this)

    this.readCoils = function (start, quantity) {
      let fc = 1
      let defer = Promise.defer()
      let pdu = Buffer.allocUnsafe(5)

      pdu.writeUInt8(fc, 0)
      pdu.writeUInt16BE(start, 1)
      pdu.writeUInt16BE(quantity, 3)

      this.queueRequest(fc, pdu, defer)

      return defer.promise
    }

    init()
  })
