class WriteMultipleRegisters {

  static fromBuffer (buffer) {
    let start = buffer.readUInt16BE(0)
    let quantity = buffer.readUInt16BE(2)

    return new WriteMultipleRegisters(start, quantity)
  }

  constructor (start, quantity) {
    this._start = start
    this._quantity = quantity
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

}

module.exports = WriteMultipleRegisters
