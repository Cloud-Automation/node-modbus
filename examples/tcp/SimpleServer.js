'use strict'

var stampit = require('stampit')
var modbus = require('../..')

var server = stampit()
    .refs({
      'logEnabled': false,
      'logLevel': 'debug',
      'port': 8888,
      'responseDelay': 0,
      'coils': new Buffer(100000),
      'holding': new Buffer(100000),
      'whiteListIPs': [
        '127.0.0.1'
      ]
    }).compose(modbus.server.tcp.complete)
    .init(function () {
      var init = function () {
        this.getCoils().writeUInt8(0)

        this.on('readCoilsRequest', function (start, quantity) {
          console.log('readCoilsRequest', start, quantity)

/*
                var oldValue = this.getCoils().readUInt8(start);

                oldValue = (oldValue + 1) % 255;

                this.getCoils().writeUInt8(oldValue, start);
*/
        })

        this.on('readHoldingRegistersRequest', function (start, quantity) {
          console.log('readHoldingRegisters', start, quantity)
        })

        this.on('writeSingleCoilRequest', function (adr, value) {
          console.log('writeSingleCoil', adr, value)
        })

        this.getHolding().writeUInt16BE(1, 0)
        this.getHolding().writeUInt16BE(2, 2)
        this.getHolding().writeUInt16BE(3, 4)
        this.getHolding().writeUInt16BE(4, 6)
        this.getHolding().writeUInt16BE(5, 8)
        this.getHolding().writeUInt16BE(6, 10)
        this.getHolding().writeUInt16BE(7, 12)
        this.getHolding().writeUInt16BE(8, 14)
      }.bind(this)

      init()
    })

server()
