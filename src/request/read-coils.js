class ReadCoilsRequestBody {

  constructor (start, count) {
    this._start = start
    this._count = count

    if (this._start > 0xFFFF) {
      throw new Error('InvalidStartAddress')
    }

    if (this._count > 0x7D0) {
      throw new Error('InvalidQuantity')
    }

    this._payload = Buffer.alloc(5)

    this._payload.writeUInt8(0x01, 0) // function code
    this._payload.writeUInt16BE(start, 1) // start address
    this._payload.writeUInt16BE(count, 3) // Quantitiy of coils
  }

  get fc () {
    return 0x01
  }

  get start () {
    return this._start
  }

  get count () {
    return this._count
  }

  get payload () {
    return this._payload
  }

}

module.exports = ReadCoilsRequestBody
