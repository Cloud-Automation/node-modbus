let debug = require('debug')('serial-response')
let CommonResponseBody = require('./common-response-body.js')

class RTUResponse {

  static fromBuffer (buffer) {
    if (buffer.length < 1) {
      return null
    }

    let address = buffer.readUInt8(0)

    debug('address', address, 'buffer', buffer)

    let body = CommonResponseBody.fromBuffer(buffer.slice(1))

    if (!body) {
      return null
    }

    let crc
    try {
      crc = buffer.readUInt16BE(1 + body.payload.length)
    } catch (e) {
      debug('If NoSuchIndexException, it is probably serial and not all data has arrived')
      return null
    }

    return new RTUResponse(address, crc, body)
  }

  constructor (address, crc, body) {
    this._address = address
    this._crc = crc
    this._body = body
  }

  get address () {
    return this._address
  }

  get crc () {
    return this._crc
  }

  get bodyLength () {
    return this._body.length + 3
  }

  get length () {
    return this._length
  }

  get body () {
    return this._body
  }

}

module.exports = RTUResponse
