class WriteMultipleCoilsRequestBody {

  constructor (address, values, quantity) {
    if (address > 0xFFFF) {
      throw new Error('InvalidStartAddress')
    }

    if (Array.isArray(values) && values.length > 0x07b0 * 8) {
      throw new Error('InvalidArraySize')
    }

    if (values instanceof Buffer && values.length > 0x07b0) {
      throw new Error('InvalidBufferSize')
    }
    if (values instanceof Buffer && values.length < quantity) {
      throw new Error('InvalidBufferSize')
    }

    this._address = address
    this._values = values
    this._quantity = quantity || values.length

    if (this._values instanceof Buffer) {
      this._byteCount = Math.ceil(this._quantity / 8)

      this._payload = Buffer.alloc(6 + this._byteCount)
      this._payload.writeUInt8(0x0F, 0) // function code
      this._payload.writeUInt16BE(this._address, 1) // start address
      this._payload.writeUInt16BE(this._quantity, 3) // quantity of coils
      this._payload.writeUInt8(this._byteCount, 5) // byte count
      this._values.copy(this._payload, 6, 0, this._byteCount) // values
    } else if (this._values instanceof Array) {
      let len = values.length
      if (values.length > 1968) {
        len = 1968
      }

      this._byteCount = Math.ceil(len / 8)
      let curByte = 0
      let curByteIdx = 0
      let cntr = 0
      let bytes = Buffer.allocUnsafe(this._byteCount)

      this._payload = Buffer.alloc(6 + this._byteCount)
      this._payload.writeUInt8(0x0F, 0) // function code
      this._payload.writeUInt16BE(this._address, 1) // start address
      this._payload.writeUInt16BE(len, 3) // quantity of coils
      this._payload.writeUInt8(this._byteCount, 5) // byte count

      for (var i = 0; i < len; i += 1) {
        curByte += values[i] ? Math.pow(2, cntr) : 0

        cntr = (cntr + 1) % 8

        if (cntr === 0 || i === len - 1) {
          bytes.writeUInt8(curByte, curByteIdx)
          curByteIdx = curByteIdx + 1
          curByte = 0
        }
      }

      bytes.copy(this._payload, 7) // values
    }
  }

  get fc () {
    return 0x0F
  }

  get start () {
    return this._address
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

module.exports = WriteMultipleCoilsRequestBody
