'use strict'

var stampit = require('stampit')
var crc = require('crc')
var ModbusCore = require('./modbus-client-core.js')

module.exports = stampit()
  .compose(ModbusCore)
  .init(function () {
    var SerialPort = require('serialport')
    var serialport

    var init = function () {
      this.setState('init')

      if (!this.portName) {
        throw new Error('No portname.')
      }

      if (!this.baudRate) {
        this.baudRate = 9600 // the most are working with 9600
      }

      if (!this.dataBits) {
        this.dataBits = 8
      }

      if (!this.stopBits) {
        this.stopBits = 1
      }

      if (!this.parity) {
        this.parity = 'none'
      }

      // TODO: flowControl - ['xon', 'xoff', 'xany', 'rtscts']

      // TODO: settings - ['brk', 'cts', 'dtr', 'dts', 'rts']

      serialport = new SerialPort(this.portName, {
        baudRate: this.baudRate,
        parity: this.parity,
        dataBits: this.dataBits,
        stopBits: this.stopBits
      })

      serialport.on('open', onOpen)
      serialport.on('close', onClose)
      serialport.on('data', onData)
      serialport.on('error', onError)

      this.on('send', onSend)
    }.bind(this)

    var onOpen = function () {
      this.emit('connect')
      this.setState('ready')
    }.bind(this)

    var onClose = function () {
      this.setState('closed')
    }.bind(this)

    var onData = function (pdu) {
      this.log.debug('received data')
      if (crc.crc16modbus(pdu) === 0) { /* PDU is valid if CRC across whole PDU equals 0, else ignore and do nothing */
        this.emit('data', pdu.slice(1))
      }
    }.bind(this)

    var onError = function (err) {
      this.emit('error', err)
    }.bind(this)

    var onSend = function (pdu) {
      var base = Buffer.from([0x01])
      var buf = Buffer.concat([base, pdu])
      var crc16 = crc.crc16modbus(buf)
      var crcBuf = Buffer.allocUnsafe(2)

      crcBuf.writeUInt16LE(crc16, 0)

      var pkt = Buffer.concat([buf, crcBuf])

      serialport.write(pkt, function (err) {
        if (err) {
          this.emit('error', err)
          return
        }
      }.bind(this))
    }.bind(this)

    this.close = function () {
      serialport.close()
    }

    init()
  })
