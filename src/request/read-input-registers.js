class ReadInputRegisters {
  constructor (start, count) {
    if (start > 0xFFFF) {
      throw new Error('InvalidStartAddress')
    }
    if (count > 0x7D0) {
      throw new Error('InvalidQuantity')
    }
    this._start = start
    this._count = count

    this._payload = Buffer.alloc(5)
    this._payload.writeUInt8(0x04, 0) // function code
    this._payload.writeUInt16BE(start, 1) // start address
    this._payload.writeUInt16BE(count, 3) // quantitiy of coils
  }

  get fc () {
    return 0x04
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

module.exports = ReadInputRegisters
