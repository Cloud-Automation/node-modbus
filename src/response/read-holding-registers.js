class ReadHoldingRegistersResponseBody {

  static fromBuffer (buffer) {
    let byteCount = buffer.readUInt8(0)
    let values = buffer.slice(1)

    return new ReadHoldingRegistersResponseBody(byteCount, values)
  }

  constructor (byteCount, values) {
    this._byteCount = byteCount
    this._values = values
  }

  get fc () {
    return 0x03
  }

  get byteCount () {
    return this._byteCount
  }

  get values () {
    return this._values
  }

}

module.exports = ReadHoldingRegistersResponseBody
