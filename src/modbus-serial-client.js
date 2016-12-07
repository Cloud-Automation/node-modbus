'use strict'

var stampit = require('stampit')
var crc = require('crc')
var ModbusCore = require('./modbus-client-core.js')

module.exports = stampit()
  .compose(ModbusCore)
  .init(function () {
    var SerialPort = require('serialport')
    var serialport
    
    var rxbuf = Buffer.alloc(256) // reserve space for incoming data
    var rxlen // number of received bytes
    var rxexplen // number of bytes expected

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
      if(pdu.length !== 0) { // at least one byte has been received
        this.log.debug('received data')
                
        if( (pdu.length + rxlen) <= rxbuf.length) { // check if data received is longer than the buffer, if then ignore
          pdu.copy(rxbuf,rxlen,0) // write received data into buffer first 
          rxlen += pdu.length // adjust the length accordingly to know where we are

          if( rxlen >= 5 ) { // check if at least data of the size of an exception message or more has been received
              if( rxlen === 5 ) { // it is exactly the size of an exception message

                  if( rxbuf[1] >= 128 && crc.crc16modbus(rxbuf.slice(0,rxlen)) === 0) { // >128 classifies an exception message
                       this.emit('data', rxbuf.slice(1,rxlen-1))
                  }

              } else { // received more bytes, can't be exception
                if(rxlen === rxexplen) { // check if number of bytes received matches the expected number
                    if( crc.crc16modbus(rxbuf.slice(0,rxlen)) === 0) {
                      this.emit('data', rxbuf.slice(1,rxlen-1))
                    }
                }
              }
           }
        }
      }
    }.bind(this)

    var onError = function (err) {
      this.emit('error', err)
    }.bind(this)

    var onSend = function (pdu) {
      

      var base = Buffer.allocUnsafe(1)
      base.writeUInt8(1)
      var buf = Buffer.concat([base, pdu])
      var crc16 = crc.crc16modbus(buf)
      var crcBuf = Buffer.allocUnsafe(2)

      crcBuf.writeUInt16LE(crc16, 0)

      var pkt = Buffer.concat([buf, crcBuf])

      rxlen = 0;

      switch(pdu[0]) { // check for the function code that is requested
          case 1:
          case 2:
              rxexplen = 5 + (Math.floor(pdu.readInt16BE(3)/8))+1; // expected response length is crc + adr +fc + len + (number of coils/8)+1 
          break;

          case 3:
          case 4: 
              rxexplen = 5 + pdu.readInt16BE(3)*2; // expected response length is crc + adr +fc + len + number of words
          break; 

          case 5:
          case 6:
          case 15:
          case 16:
              rxexplen = 8; // expected response length is fix 8
          break;


          default:

          break;
      }
      
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
