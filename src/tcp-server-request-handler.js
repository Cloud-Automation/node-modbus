'use strict'

let TCPRequest = require('./tcp-request.js')

class TCPRequestHandler {

  constructor () {
    this._requests = []
    this._buffer = Buffer.alloc(0)
  }

  shift () {
    return this._requests.shift()
  }

  handle (data) {
    this._buffer = Buffer.concat([this._buffer, data])

    do {
      let request = TCPRequest.fromBuffer(this._buffer)

      if (!request) {
        return
      }

      this._requests.unshift(request)

      this._buffer = this._buffer.slice(request.byteCount)
    } while (1)
  }

}

module.exports = TCPRequestHandler
