'use strict'

let debug = require('debug')('user-request')

/** Request created for the user. It contains the actual modbus request,
 * the timeout handler and the promise delivered from the readCoils method
 * in the client.
 * @class
 */
class UserRequest {
  constructor (request, timeout) {
    debug('creating new user request with timeout', timeout)
    this._request = request
    this._timeout = timeout || 5000

    this._promise = new Promise(function (resolve, reject) {
      this._resolve = resolve
      this._reject = reject
    }.bind(this))
  }

  createPayload () {
    return this._request.createPayload()
  }

  start (cb) {
    this._timer = setTimeout(function () {
      this._reject({
        'err': 'Timeout',
        'message': 'Request timed out'
      })
      cb()
    }.bind(this), this._timeout)
  }

  done () {
    clearTimeout(this._timer)
  }

  get request () {
    return this._request
  }

  get timeout () {
    return this._timeout
  }

  get promise () {
    return this._promise
  }

  resolve (response) {
    return this._resolve({
      'response': response,
      'request': this._request
    })
  }

  get reject () {
    return this._reject
  }
}

module.exports = UserRequest
