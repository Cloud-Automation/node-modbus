let CRC = require('crc')

class ModbusRTURequest {
  constructor (address, body) {
    this._address = address
    this._body = body
  }

  get crc () {
    return this._crc
  }

  get body () {
    return this._body
  }

  get name () {
    return this._body.name
  }

  createPayload () {
    let bodyPayload = this._body.createPayload()

    this._crc = CRC.crc16modbus(Buffer.concat([Buffer.from([this._address]), bodyPayload]))

    let payload = Buffer.alloc(1 + bodyPayload.length + 2)
    payload.writeUInt8(this._address, 0) // address
    bodyPayload.copy(payload, 1) // copy body
    payload.writeUInt16BE(this._crc, 1 + bodyPayload.length) // crc

    return payload
  }

  get byteCount () {
    return this.body.byteCount + 3
  }
}

module.exports = ModbusRTURequest
