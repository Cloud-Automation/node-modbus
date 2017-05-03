class ReadInputRegistersResponseBody {

  static fromBuffer (buffer) {
    let byteCount = buffer.readUInt8(0)
    let values = buffer.slice(1)

    return new ReadInputRegistersResponseBody(byteCount, values)
  }

  constructor (byteCount, values) {
    this._byteCount = byteCount
    this._values = values
  }

  get fc () {
    return 0x04
  }

  get byteCount () {
    return this._byteCount
  }

  get values () {
    return this._values
  }

}

module.exports = ReadInputRegistersResponseBody
