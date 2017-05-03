let CRC = require('crc')

class RTURequest {

  constructor (address, body) {
    this._address = address
    this._body = body

    this._crc = CRC.crc16modbus(body.payload)

    this._payload = Buffer.alloc(1 + this._body.payload.length + 2)
    this._payload.writeUInt8(this._address, 0) // address
    this._body.payload.copy(this._payload, 1) // copy body
    this._payload.writeUInt16BE(this._crc, 1 + this._body.payload.length) // crc

    this._promise = new Promise(function (resolve, reject) {
      this._resolve = resolve
      this._reject = reject
    }.bind(this))
  }

  get crc () {
    return this._crc
  }

  get body () {
    return this._body
  }

  get payload () {
    return this._payload
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

module.exports = RTURequest
