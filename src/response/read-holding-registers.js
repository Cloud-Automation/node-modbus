class ReadHoldingRegistersResponseBody {

  static fromBuffer (buffer) {
    let byteCount = buffer.readUInt8(0)
    let values = buffer.slice(1)
    let payload = buffer.slice(1)

    return new ReadHoldingRegistersResponseBody(byteCount, values, payload)
  }

  constructor (byteCount, values, payload) {
    this._byteCount = byteCount
    this._values = values
    this._payload = payload
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

  get payload () {
    return this._payload
  }

}

module.exports = ReadHoldingRegistersResponseBody
