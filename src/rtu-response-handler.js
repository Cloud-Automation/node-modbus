let debug = require('debug')('rtu-response-handler')
let RTUResponse = require('./rtu-response.js')

class RTUResponseHandler {

  constructor () {
    this._buffer = Buffer.alloc(0)
    this._messages = []
  }

  handleData (data) {
    debug('receiving new data')
    this._buffer = Buffer.concat([this._buffer, data])

    debug('buffer', this._buffer)

    do {
      let response = RTUResponse.fromBuffer(this._buffer)

      if (!response) {
        debug('not enough data available to parse')
        return
      }

      debug('crc', response.crc)

      debug('reset buffer from', this._buffer.length, 'to', (this._buffer.length - response.length))

      /* reduce buffer */
      this._buffer = this._buffer.slice(response.length)

      this._messages.push(response)
    } while (1)
  }

  shift () {
    return this._messages.shift()
  }

}

module.exports = RTUResponseHandler
