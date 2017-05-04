let debug = require('debug')('tcp-request')

class TCPRequest {

  constructor (id, unitId, body, timeout) {
    this._id = id
    this._unitId = unitId
    this._body = body
    this._timeout = timeout || 5000
    this._timedOut = false
    this._payload = Buffer.alloc(7 + body.payload.length)

    this._payload.writeUInt16BE(this._id, 0) // transaction id
    this._payload.writeUInt16BE(0x0000, 2) // protocol version
    this._payload.writeUInt16BE(body.payload.length + 1, 4) // length
    this._payload.writeUInt8(unitId, 6) // unit id

    this._body.payload.copy(this._payload, 7)

    this._promise = new Promise(function (resolve, reject) {
      this._resolve = resolve
      this._reject = reject
    }.bind(this))
  }

  start () {
    this._timer = setTimeout(function () {
      debug('request timed out, rejecting')
      this._reject({'err': 'Timeout'})
      this._timedOut = true
    }.bind(this), this._timeout)
  }

  done () {
    clearTimeout(this._timer)
  }

  get id () {
    return this._id
  }

  get unitId () {
    return this._unitId
  }

  get body () {
    return this._body
  }

  get payload () {
    return this._payload
  }

  get length () {
    return this._body.length
  }

  get timedOut () {
    return this._timedOut
  }

  get promise () {
    return this._promise
  }

  get reject () {
    return this._reject
  }

  get resolve () {
    return this._resolve
  }

}

module.exports = TCPRequest
