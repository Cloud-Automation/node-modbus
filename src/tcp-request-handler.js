'use strict'

let debug = require('debug')('tcp-request-handler')
let TCPRequest = require('./tcp-request.js')
let ExceptionResponseBody = require('./response/exception.js')

const OUT_OF_SYNC = 'OutOfSync'
const OFFLINE = 'Offline'
const MODBUS_EXCEPTION = 'ModbusException'
const PROTOCOL = 'Protocol'

class TCPRequestHandler {

  constructor (socket, unitId, timeout) {
    this._socket = socket
    this._unitId = unitId
    this._timeout = timeout || 5000
    this._requests = []
    this._currentRequest = null
    this._requestId = 0
    this._state = 'offline'

    this._socket.on('connect', this._onConnect.bind(this))
    this._socket.on('close', this._onClose.bind(this))
  }

  _clearAllRequests () {
    while (this._requests.length > 0) {
      let req = this._requests.shift()
      req.reject({
        'err': OUT_OF_SYNC,
        'message': 'rejecting because of earlier OutOfSync error'
      })
    }
  }

  _onConnect () {
    this._state = 'online'
  }

  _onClose () {
    this._state = 'offline'
    this._clearAllRequests()
  }

  register (requestBody) {
    this._requestId = (this._requestId + 1) % 0xFFFF
    debug('registrating new request', 'transaction id', this._requestId, 'unit id', this._unitId, 'length', requestBody.payload.length)

    let tcpRequest = new TCPRequest(this._requestId, this._unitId, requestBody, this._timeout)

    this._requests.push(tcpRequest)
    this._flush()

    return tcpRequest.promise
  }

  handle (response) {
    if (!response) {
      return
    }

    let request = this._currentRequest

    if (!request || request.timedOut) {
      debug('no current request, no idea where this came from')
      return
    }

    /* check if response id equals request id */
    if (response.id !== request.id) {
      debug('something weird is going on, response transition id does not equal request transition id')
      /* clear all request, client must be reset */
      request.reject({
        'err': OUT_OF_SYNC,
        'message': 'request fc and response fc does not match.'
      })
      this._currentRequest.done()
      this._currentRequest = null
      this._clearAllRequests()
      return
    }

    /* check if protocol version of response is 0x00 */
    if (response.protocol !== 0x00) {
      debug('server responds with wrong protocol version')
      request.reject({
        'err': PROTOCOL,
        'message': 'Unknown protocol version ' + response.protocol
      })
      this._currentRequest.done()
      this._currentRequest = null
      this._clearAllRequests()
      return
    }

    /* check that response fc equals request id */
    if (response.body.fc < 0x80 && response.body.fc !== request.body.fc) {
      debug('something is weird, request fc and response fc do not match.')
      /* clear all request, client must be reset */
      request.reject({
        'err': OUT_OF_SYNC,
        'message': 'request fc and response fc does not match.'
      })
      this._currentRequest.done()
      this._currentRequest = null
      this._clearAllRequests()
      return
    }

    /* check if response is an exception */
    if (response.body instanceof ExceptionResponseBody) {
      debug('response is a exception')
      request.reject({
        'err': MODBUS_EXCEPTION,
        'response': response
      })
      this._currentRequest.done()
      this._currentRequest = null
      this._flush()
      return
    }

    /* everything is fine, handle response */
    request.resolve({ 'response': response, 'request': request })

    this._currentRequest.done()
    this._currentRequest = null

    /* start next request */
    this._flush()
  }

    /* execute next request */
  _flush () {
    debug('flushing')
    if (this._currentRequest !== null) {
      debug('executing another request, come back later')
      return
    }

    if (this._requests.length === 0) {
      debug('no request to be executed')
      return
    }

    this._currentRequest = this._requests.shift()

    if (this._state === 'offline') {
      debug('rejecting request immediatly, client offline')
      this._currentRequest.reject({
        'err': OFFLINE,
        'message': 'no connection to modbus server'
      })
      this._currentRequest.done()
      this._currentRequest = null
      /* start next request */
      setTimeout(this._flush.bind(this), 0)
      return
    }

    debug('flushing new request', this._currentRequest.payload)

    this._currentRequest.start()

    this._socket.write(this._currentRequest.payload, function () {
      debug('request fully flushed')
    })
  }

}

module.exports = TCPRequestHandler
