'use strict'

var stampit = require('stampit')
var Log = require('stampit-log')
var StateMachine = require('stampit-state-machine')

var ExceptionMessage = {
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

module.exports = stampit()
  .compose(StateMachine)
  .compose(Log)
  .init(function () {
    var responseHandler = { }
    var currentRequest = null

    this.reqFifo = []

    var init = function () {
      if (!this.timeout) {
        this.timeout = 5 * 1000 // 5s
      }

      this.on('data', onData)
      this.on('newState_ready', flush)
      this.on('newState_closed', onClosed)
    }.bind(this)

    var flush = function () {
      this.log.debug('Trying to flush data.')

      if (this.reqFifo.length === 0) {
        this.log.debug('Nothing in request pipe.')
        return
      }

      currentRequest = this.reqFifo.shift()

      currentRequest.timeout = setTimeout(function () {
        currentRequest.defer.reject({ err: 'timeout' })
        this.emit('trashCurrentRequest')

        this.logError('Request timed out.')

        this.setState('error')
      //                this.setState('ready')
      }.bind(this), this.timeout)

      this.setState('waiting')
      this.emit('send', currentRequest.pdu)

      this.log.debug('Data flushed.')
    }.bind(this)

    var onClosed = function () {
      if (currentRequest) {
        this.log.debug('Clearing timeout of the current request.')
        clearTimeout(currentRequest.timeout)
      }

      this.log.debug('Cleaning up request fifo.')
      this.reqFifo = []
    }.bind(this)

    var handleErrorPDU = function (pdu) {
      var errorCode = pdu.readUInt8(0)

      // if error code is smaller than 0x80
      // ths pdu describes no error

      if (errorCode < 0x80) {
        return false
      }

      // pdu describes an error

      var exceptionCode = pdu.readUInt8(1)
      var message = ExceptionMessage[exceptionCode]

      var err = {
        errorCode: errorCode,
        exceptionCode: exceptionCode,
        message: message
      }

      // call the desired deferred
      currentRequest.defer.reject(err)

      return true
    }

    /**
      *  Handle the incoming data, cut out the mbap
      *  packet and send the pdu to the listener
      */
    var onData = function (pdu) {
      this.log.debug('received data')

      if (!currentRequest) {
        this.log.debug('No current request.')
        return
      }

      clearTimeout(currentRequest.timeout)

      // check pdu for error
      if (handleErrorPDU(pdu)) {
        this.log.debug('Received pdu describes an error.')
        currentRequest = null
        this.setState('ready')
        return
      }

      // handle pdu

      var handler = responseHandler[currentRequest.fc]
      if (!handler) {
        this.log.debug('Found not handler for fc', currentRequest.fc)
        throw new Error('No handler implemented for fc ' + currentRequest.fc)
      }

      handler(pdu, currentRequest)

      this.setState('ready')
    }.bind(this)

    this.addResponseHandler = function (fc, handler) {
      responseHandler[fc] = handler

      return this
    }.bind(this)

    this.queueRequest = function (fc, pdu, defer) {
      var req = {
        fc: fc,
        defer: defer,
        pdu: pdu
      }

      this.reqFifo.push(req)

      if (this.inState('ready')) {
        flush()
      }
    }

    init()
  })
