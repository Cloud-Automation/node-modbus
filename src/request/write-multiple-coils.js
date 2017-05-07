let ModbusRequestBody = require('./request-body.js')

/** Write Multiple Coils Request Body
 * @extends ModbusRequestBody
 */
class WriteMultipleCoilsRequestBody extends ModbusRequestBody {

  /** Create a new Write Multiple Coils Request Body.
   * @param {Number} address Write address.
   * @param {Array|Buffer} values Values to be written. Either a Array of Boolean values or a Buffer.
   * @param {Number} quantity In case of values being a Buffer, specify the number of coils that needs to be written.
   * @throws {InvalidStartAddressException} When address is larger than 0xFFFF.
   * @throws {InvalidArraySizeException}
   * @throws {InvalidBufferSizeException}
   */
  constructor (address, values, quantity) {
    super(0x0F)
    if (address > 0xFFFF) {
      throw new Error('InvalidStartAddress')
    }

    if (Array.isArray(values) && values.length > 0x07b0 * 8) {
      throw new Error('InvalidArraySize')
    }

    if (values instanceof Buffer && values.length > 0x07b0) {
      throw new Error('InvalidBufferSize')
    }
    if (values instanceof Buffer && (values.length * 8) < quantity) {
      throw new Error('InvalidBufferSize')
    }

    this._address = address
    this._values = values
    this._quantity = quantity || values.length

    if (this._values instanceof Buffer) {
      this._byteCount = Math.ceil(this._quantity / 8)
    }

    if (this._values instanceof Array) {
      this._byteCount = Math.ceil(this._values.length / 8)
    }
  }

  /** Address to be written to. */
  get address () {
    return this._address
  }

  /** Values */
  get values () {
    return this._values
  }

  /** Quantity of coils */
  get quantity () {
    return this._quantity
  }

  get byteCount () {
    return this._byteCount
  }

  createPayload () {
    if (this._values instanceof Buffer) {
      this._byteCount = Math.ceil(this._quantity / 8)

      payload.writeUInt8(this._fc, 0) // function code
      payload.writeUInt16BE(this._address, 1) // start address
      payload.writeUInt16BE(this._quantity, 3) // quantity of coils
      payload.writeUInt8(this._byteCount, 5) // byte count
      this._values.copy(payload, 6, 0, this._byteCount) // values
    } else if (this._values instanceof Array) {
      let len = this._values.length
      if (this._values.length > 1968) {
        len = 1968
      }

      let curByte = 0
      let curByteIdx = 0
      let cntr = 0
      let bytes = Buffer.allocUnsafe(this._byteCount)

      let payload = Buffer.alloc(6 + this._byteCount)
      payload.writeUInt8(this._fc, 0) // function code
      payload.writeUInt16BE(this._address, 1) // start address
      payload.writeUInt16BE(len, 3) // quantity of coils
      payload.writeUInt8(this._byteCount, 5) // byte count

      for (var i = 0; i < len; i += 1) {
        curByte += this._values[i] ? Math.pow(2, cntr) : 0

        cntr = (cntr + 1) % 8

        if (cntr === 0 || i === len - 1) {
          bytes.writeUInt8(curByte, curByteIdx)
          curByteIdx = curByteIdx + 1
          curByte = 0
        }
      }

      bytes.copy(payload, 7) // values
    }
  }

}

module.exports = WriteMultipleCoilsRequestBody
