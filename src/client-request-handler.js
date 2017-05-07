'use strict'

const OUT_OF_SYNC = 'OutOfSync'
const OFFLINE = 'Offline'
const MODBUS_EXCEPTION = 'ModbusException'

let debug = require('debug')('request-handler')
let UserRequest = require('./user-request.js')
let ExceptionResponseBody = require('./response/exception.js')

/** Common Request Handler
 * @abstract
 */
class ModbusClientRequestHandler {

  /** Create a new Request handler for Client requests
   * @param {net.Socket} socket A net.Socket object.
   * @param {Number} timeout The request timeout value in ms.
   */
  constructor (socket, timeout) {
    if (new.target === ModbusClientRequestHandler) {
      throw new TypeError('Cannot instantiate ModbusClientRequestHandler directly.')
    }
    this._socket = socket
    this._timeout = timeout
    this._requests = []
    this._currentRequest = null
    this._state = 'offline'
  }

  _clearCurrentRequest () {
    if (!this._currentRequest) {
      return
    }
    this._currentRequest.done()
    this._currentRequest = null
  }

  _clearAllRequests () {
    this._clearCurrentRequest()

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

  /** Register a new request.
   * @param {RequestBody} requestBody A request body to execute a modbus function.
   * @returns {Promise} A promise to handle the request outcome.
   */
  register (request) {
    let userRequest = new UserRequest(request, this._timeout)

    this._requests.push(userRequest)
    this._flush()

    return userRequest.promise
  }

  /** Handle a ModbusTCPResponse object.
   * @param {ModbusTCPResponse} response A Modbus TCP Response.
   */
  handle (response) {
    debug('incoming response')
    if (!response) {
      debug('well, sorry I was wrong, no response at all')
      return
    }

    let userRequest = this._currentRequest

    if (!userRequest) {
      debug('no current request, no idea where this came from')
      return
    }

    let request = userRequest.request

    /* check that response fc equals request id */
    if (response.body.fc < 0x80 && response.body.fc !== request.body.fc) {
      debug('something is weird, request fc and response fc do not match.')
      /* clear all request, client must be reset */
      request.reject({
        'err': OUT_OF_SYNC,
        'message': 'request fc and response fc does not match.'
      })
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
      this._clearCurrenRequest()
      this._flush()
      return
    }

    /* everything is fine, handle response */
    debug('resolving request')
    userRequest.resolve(response)

    this._clearCurrentRequest()

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
      this._clearCurrentRequest()
      /* start next request */
      setTimeout(this._flush.bind(this), 0)
      return
    }

    let payload = this._currentRequest.createPayload()

    debug('flushing new request', payload)

    this._currentRequest.start(function () {
      this._clearCurrentRequest()
      this._flush()
    }.bind(this))

    this._socket.write(payload, function () {
      debug('request fully flushed')
    })
  }

}

module.exports = ModbusClientRequestHandler
