let debug = require('debug')('serial-request-handler')
let SerialRequest = require('./serial-request.js')
let ExceptionResponseBody = require('./response/exception.js')
let CRC = require('crc')

class SerialRequestHandler {

  constructor (socket) {
    this._socket = socket
    this._requests = []
    this._currentRequest = null
  }

  _clearAllRequests () {
    while (this._requests.length > 0) {
      let req = this._requests.shift()
      req.reject()
    }
  }

  register (requestBody) {
    debug('registrating new request')

    let request = new SerialRequest(requestBody)

    this._requests.push(request)
    this._flush()

    return request.promise
  }

  handle (response) {
    if (!response) {
      return
    }

    let request = this._currentRequest

    if (!request) {
      debug('no current request, no idea where this came from')
      return
    }

    let crc = CRC.crc16modbus(response.body.payload)

    if (response.crc !== crc) {
      debug('CRC does not match')
      request.reject({
        'err': 'crcMismatch',
        'message': 'the response payload does not match the crc'
      })
      this._currentRequest = null
      this._flush()
      return
    }

    /* check that response fc equals request id */
    if (response.body.fc !== request.body.fc) {
      debug('something is weird, request fc and response fc do not match.')
      /* clear all request, client must be reset */
      request.reject({
        'err': 'outOfSync',
        'message': 'request fc and response fc does not match.'
      })
      this._currentRequest = null
      this._clearAllRequests()
      return
    }

    /* check if response is an exception */
    if (response.body instanceof ExceptionResponseBody) {
      request.reject({
        'err': 'modbus',
        'code': response.body.code,
        'message': response.body.message
      })
      this._currentRequest = null
      this._flush()
      return
    }

    /* everything is fine, handle response */
    request.resolve({ 'response': response, 'request': request })

    this._currentRequest = null

    /* start next request */
    this._flush()
  }

    /* execute next request */
  _flush () {
    if (this._currentRequest !== null) {
      debug('executing another request, come back later')
      return
    }

    if (this._requests.length === 0) {
      debug('no request to be executed')
      return
    }

    this._currentRequest = this._requests.shift()

    debug('flushing new request', this._currentRequest.payload)

    this._socket.write(this._currentRequest.payload, function () {
      debug('request fully flushed')
    })
  }

}

module.exports = SerialRequestHandler
