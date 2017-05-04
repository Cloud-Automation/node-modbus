let debug = require('debug')('tcp-response')
let CommonResponseBody = require('./common-response-body.js')

class TCPResponse {

  static fromBuffer (buffer) {
    if (buffer.length < 7) {
      return null
    }

    let id = buffer.readUInt16BE(0)
    let protocol = buffer.readUInt16BE(2)
    let length = buffer.readUInt16BE(4)
    let unitId = buffer.readUInt8(6)

    debug('tcp header complete, id', id, 'protocol', protocol, 'length', length, 'unitId', unitId)
    debug('buffer', buffer)

    let body = CommonResponseBody.fromBuffer(buffer.slice(7, 7 + length - 1))

    if (!body) {
      debug('not enough data for a response body')
      return null
    }

    return new TCPResponse(id, protocol, length, unitId, body)
  }

  constructor (id, protocol, bodyLength, unitId, body) {
    this._id = id
    this._protocol = protocol
    this._bodyLength = bodyLength
    this._length = this._bodyLength + 6
    this._unitId = unitId
    this._body = body
  }

  get id () {
    return this._id
  }

  get protocol () {
    return this._protocol
  }

  get bodyLength () {
    return this._bodyLength
  }

  get length () {
    return this._length
  }

  get unitId () {
    return this._unitId
  }

  get body () {
    return this._body
  }

}

module.exports = TCPResponse
