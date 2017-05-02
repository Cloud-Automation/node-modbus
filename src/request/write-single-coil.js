class WriteSingleCoilRequestBody {

  constructor (address, value) {
    this._address = address
    this._value = value

    this._payload = Buffer.alloc(5)
    this._payload.writeUInt8(0x05, 0) // function code
    this._payload.writeUInt16BE(address, 1) // output address
    this._payload.writeUInt16BE(value ? 0xFF00 : 0x0000, 3) // output value
  }

  get fc () {
    return 0x05
  }

  get address () {
    return this._address
  }

  get value () {
    return this._value ? 0xFF00 : 0x0000
  }

  get payload () {
    return this._payload
  }

}

module.exports = WriteSingleCoilRequestBody
