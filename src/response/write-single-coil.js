class WriteSingleCoil {
  static fromBuffer (buffer) {
    let address = buffer.readUInt16BE(0)
    let value = buffer.readUInt16BE(2) === 0xFF00

    return new WriteSingleCoil(address, value)
  }

  constructor (address, value) {
    this._address = address
    this._value = value
  }

  get fc () {
    return 0x05
  }

  get address () {
    return this._address
  }

  get value () {
    return this._value
  }

  get length () {
    return 5
  }
}

module.exports = WriteSingleCoil
