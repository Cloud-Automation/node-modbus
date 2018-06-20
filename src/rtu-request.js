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
    let crBu = Buffer.alloc(2)
    crBu.writeUInt16LE(this._crc)
    let idBuf = Buffer.from([this._address])
    let payload = Buffer.from([idBuf, bodyPayload, crBu])

    return payload
  }

  get byteCount () {
    return this.body.byteCount + 3
  }
}

module.exports = ModbusRTURequest
