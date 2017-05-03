let debug = require('debug')('tcp-response-handler')
let TCPResponse = require('./tcp-response.js')

class TCPResponseHandler {

  constructor () {
    this._buffer = Buffer.alloc(0)
    this._messages = []
  }

  handleData (data) {
    debug('receiving new data', data)
    this._buffer = Buffer.concat([this._buffer, data])

    debug('buffer', this._buffer)

    do {
      let response = TCPResponse.fromBuffer(this._buffer)

      if (!response) {
        debug('not enough data available to parse')
        return
      }

      debug('response id', response.id, 'protocol', response.protocol, 'length', response.length, 'unit', response.unitId)

      debug('reset buffer from', this._buffer.length, 'to', (this._buffer.length - response.length))

      this._messages.push(response)

      /* reduce buffer */
      this._buffer = this._buffer.slice(response.length)
    } while (1)
  }

  shift () {
    return this._messages.shift()
  }

}

module.exports = TCPResponseHandler
