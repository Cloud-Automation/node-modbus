'use strict'

var stampit = require('stampit')
var EventBus = require('stampit-event-bus')
var Log = require('stampit-log')

var core = stampit()
  .compose(EventBus, Log)
  .init(function () {
    var coils
    var holding
    var input
    var handler = { }

    var init = function () {
      if (!this.coils) {
        coils = Buffer.alloc(1024, 0)
      } else {
        coils = this.coils
      }

      if (!this.holding) {
        holding = Buffer.alloc(1024, 0)
      } else {
        holding = this.holding
      }

      if (!this.input) {
        input = Buffer.alloc(1024, 0)
      } else {
        input = this.input
      }
    }.bind(this)

    this.onData = function (pdu, callback) {
      // get fc and byteCount in advance
      var fc = pdu.readUInt8(0)

      // get the pdu handler
      var reqHandler = handler[fc]

      if (!reqHandler) {
        // write a error/exception pkt to the
        // socket with error code fc + 0x80 and
        // exception code 0x01 (Illegal Function)

        this.log.debug('no handler for fc', fc)

        var buf = Buffer.alloc(2)
        buf.writeUInt8(fc + 0x80, 0)
        buf.writeUInt8(0x01, 1)

        callback(buf)

        return
      }

      reqHandler(pdu, function (response) {
        callback(response)
      })
    }.bind(this)

    this.setRequestHandler = function (fc, callback) {
      this.log.debug('setting request handler', fc)

      handler[fc] = callback

      return this
    }

    this.getCoils = function () {
      return coils
    }

    this.getInput = function () {
      return input
    }

    this.getHolding = function () {
      return holding
    }

    init()
  })

module.exports = core
