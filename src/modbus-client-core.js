'use strict'

let debug = require('debug')('modbus-core-client')
let EventEmitter = require('events')

class ModbusClientCore {

  constructor (socket, options) {
    this._socket = socket
    this._responseHandler = { }
    this._currentRequest = null
    this._options = options
    this._events = new EventEmitter()
    this._currentState = 'offline'

    this._reqFifo = []

    if (!options) {
      options = {}
    }

    if (!options.timeout) {
      options.timeout = 5 * 1000 // 5s
    }

    this._socket.on('data', this._onData.bind(this))
  }

  flush () {
    debug('Trying to flush data.')

    if (this._reqFifo.length === 0) {
      debug('Nothing in request pipe.')
      return
    }

    this._currentRequest = this._reqFifo.shift()

    this._currentRequest.timeout = setTimeout(function () {
      this._currentRequest.reject({ err: 'timeout' })
      this._socket.trash()

      debug('Request timed out.')

      this._currentState = 'error'
    }.bind(this), this._options.timeout)

    this._currentState = 'waiting'

    this._socket.write(this._currentRequest.pdu)
//    this.emit('send', currentRequest.pdu)

    debug('Data flushed.')
  }

  _onClosed () {
    if (this._currentRequest) {
      debug('Clearing timeout of the current request.')
      clearTimeout(this._currentRequest.timeout)
    }

    debug('Cleaning up request fifo.')
    this._reqFifo = []
  }

  _handleErrorPDU (pdu) {
    var errorCode = pdu.readUInt8(0)

      // if error code is smaller than 0x80
      // ths pdu describes no error

    if (errorCode < 0x80) {
      return false
    }

      // pdu describes an error

    let exceptionCode = pdu.readUInt8(1)
    let message = ModbusClientCore.ExceptionMessage[exceptionCode]

    let err = {
      errorCode: errorCode,
      exceptionCode: exceptionCode,
      message: message
    }

      // call the desired deferred
    this._currentRequest.reject(err)

    return true
  }

    /**
      *  Handle the incoming data, cut out the mbap
      *  packet and send the pdu to the listener
      */
  _onData (pdu) {
    debug('received data')

    if (!this._currentRequest) {
      debug('No current request.')
      return
    }

    clearTimeout(this._currentRequest.timeout)

      // check pdu for error
    if (this._handleErrorPDU(pdu)) {
      debug('Received pdu describes an error.')
      this._currentRequest = null
      this._currentState = 'ready'
      return
    }

      // handle pdu

    var handler = this._responseHandler[this._currentRequest.fc]
    if (!handler) {
      debug('Found not handler for fc', this._currentRequest.fc)
      throw new Error('No handler implemented for fc ' + this._currentRequest.fc)
    }

    handler(pdu, this._currentRequest)

    this._currentState = 'ready'
  }

  addResponseHandler (fc, handler) {
    this._responseHandler[fc] = handler

    return this
  }

  _queueRequest (fc, pdu, defer) {
    let req = {
      fc: fc,
      defer: defer,
      pdu: pdu
    }

    this._reqFifo.push(req)

    if (this._currentState === 'ready') {
      this._flush()
    }
  }
}

ModbusClientCore.ExceptionMessage = {
  0x01: 'ILLEGAL FUNCTION',
  0x02: 'ILLEGAL DATA ADDRESS',
  0x03: 'ILLEGAL DATA VALUE',
  0x04: 'SLAVE DEVICE FAILURE',
  0x05: 'ACKNOWLEDGE',
  0x06: 'SLAVE DEVICE BUSY',
  0x08: 'MEMORY PARITY ERROR',
  0x0A: 'GATEWAY PATH UNAVAILABLE',
  0x0B: 'GATEWAY TARGET DEVICE FAILED TO RESPOND'

}

module.exports = ModbusClientCore
