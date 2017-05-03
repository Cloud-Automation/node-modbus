class WriteMultipleRegistersRequestBody {

  constructor (start, values) {
    this._start = start
    this._values = values

    if (this._values instanceof Buffer) {
      this._byteCount = Math.min(this._values.length, 0xF6)
      this._quantity = Math.floor(this._byteCount / 2)

      this._payload = Buffer.alloc(6 + this._byteCount)
      this._payload.writeUInt8(0x10, 0) // function code
      this._payload.writeUInt16BE(this._start, 1) // start address
      this._payload.writeUInt16BE(this._quantity, 3)
      this._payload.writeUInt8(this._byteCount, 5)
      this._values.copy(this._payload, 6, 0, this._byteCount)
    } else if (this._values instanceof Array) {
      this._byteCount = Math.min(this._values.length * 2, 0xF6)
      this._quantity = (this._byteCount / 2).toFixed(0)

      this._payload = Buffer.alloc(6 + this._byteCount)
      this._payload.writeUInt8(0x10, 0) // function code
      this._payload.writeUInt16BE(this._start, 1) // start address
      this._payload.writeUInt16BE(this._quantity, 3)
      this._payload.writeUInt8(this._byteCount, 5)
      this._values.some(function (v, i) {
        if (i >= this._quantity) {
          return true
        }
        this._payload.writeUInt16BE(v, 6 + i * 2)
      }.bind(this))
    }
  }

  get fc () {
    return 0x10
  }

  get start () {
    return this._start
  }

  get quantity () {
    return this._quantity
  }

  get byteCount () {
    return this._byteCount
  }

  get payload () {
    return this._payload
  }

}

module.exports = WriteMultipleRegistersRequestBody
