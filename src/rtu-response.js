let debug = require('debug')('rtu-response')
let CommonResponseBody = require('./common-response-body.js')

class ModbusRTUResponse {

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
      crc = buffer.readUInt16BE(1 + body.length)
    } catch (e) {
      debug('If NoSuchIndexException, it is probably serial and not all data has arrived')
      return null
    }

    return new ModbusRTUResponse(address, crc, body)
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

  get body () {
    return this._body
  }

  get byteCount () {
    return this._body.byteCount + 3
  }

}

module.exports = ModbusRTUResponse
