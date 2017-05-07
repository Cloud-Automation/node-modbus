let ModbusRequestBody = require('./request-body.js')

/** Write Multiple Registers Request Body
 * @extends ModbusRequestBody
 */
class WriteMultipleRegistersRequestBody extends ModbusRequestBody {

  /** Create a new Write Multiple Registers Request Body.
   * @param {Number} address Write address.
   * @param {Array|Buffer} values Values to be written. Either a Array of UInt16 values or a Buffer.
   * @param {Number} quantity In case of values being a Buffer, specify the number of coils that needs to be written.
   * @throws {InvalidStartAddressException} When address is larger than 0xFFFF.
   * @throws {InvalidArraySizeException}
   * @throws {InvalidBufferSizeException}
   */
  constructor (start, values) {
    super(0x10)
    if (start > 0xFFFF) {
      throw new Error('InvalidStartAddress')
    }
    if (Array.isArray(values) && values.length > 0x7b) {
      throw new Error('InvalidArraySize')
    }
    if (values instanceof Buffer && values.length > 0x7b * 2) {
      throw new Error('InvalidBufferSize')
    }
    this._start = start
    this._values = values

    if (this._values instanceof Buffer) {
      this._byteCount = Math.min(this._values.length, 0xF6)
      this._quantity = Math.floor(this._byteCount / 2)
    }

    if (this._values instanceof Array) {
      this._byteCount = Math.min(this._values.length * 2, 0xF6)
      this._quantity = (this._byteCount / 2).toFixed(0)
    }
  }

  /** Start Address to begin writing data */
  get start () {
    return this._start
  }

  /** Quantity of registers beein written */
  get quantity () {
    return this._quantity
  }

  /** Values to be written */
  get values () {
    return this._values
  }

  get byteCount () {
    return this._byteCount
  }

  createPayload () {
    if (this._values instanceof Buffer) {
      let payload = Buffer.alloc(6 + this._byteCount)
      payload.writeUInt8(this._fc, 0) // function code
      payload.writeUInt16BE(this._start, 1) // start address
      payload.writeUInt16BE(this._quantity, 3)
      payload.writeUInt8(this._byteCount, 5)
      this._values.copy(payload, 6, 0, this._byteCount)
    } else if (this._values instanceof Array) {
      let payload = Buffer.alloc(6 + this._byteCount)
      payload.writeUInt8(this._fc, 0) // function code
      payload.writeUInt16BE(this._start, 1) // start address
      payload.writeUInt16BE(this._quantity, 3)
      payload.writeUInt8(this._byteCount, 5)
      this._values.some(function (v, i) {
        if (i >= this._quantity) {
          return true
        }
        payload.writeUInt16BE(v, 6 + i * 2)
      }.bind(this))
    }
  }

}

module.exports = WriteMultipleRegistersRequestBody
