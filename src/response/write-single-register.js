class WriteSingleRegister {
  static fromBuffer (buffer) {
    let address = buffer.readUInt16BE(0)
    let value = buffer.readUInt16BE(2)

    return new WriteSingleRegister(address, value)
  }

  constructor (address, value) {
    this._address = address
    this._value = value
  }

  get fc () {
    return 0x06
  }

  get address () {
    return this._address
  }

  get value () {
    return this._value
  }
}

module.exports = WriteSingleRegister
