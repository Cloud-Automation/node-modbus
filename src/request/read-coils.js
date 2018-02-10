let ModbusRequestBody = require('./request-body.js')

/** Read Coils Request Body
 * @extends ModbusRequestBody
 */
class ReadCoilsRequestBody extends ModbusRequestBody {
  static fromBuffer (buffer) {
    try {
      let fc = buffer.readUInt8(0)

      if (fc !== 0x01) {
        return null
      }

      let start = buffer.readUInt16BE(1)
      let quantity = buffer.readUInt16BE(3)

      return new ReadCoilsRequestBody(start, quantity)
    } catch (e) {
      return null
    }
  }

  /** Create a new Read Coils Request Body.
   * @param {Number} start Start Address.
   * @param {Number} count Quantity of coils to be read.
   * @throws {InvalidStartAddressException} When Start address is larger than 0xFFFF.
   * @throws {InvalidQuantityException} When count is larger than 0x7D0.
   */
  constructor (start, count) {
    super(0x01)
    this._start = start
    this._count = count

    if (this._start > 0xFFFF) {
      throw new Error('InvalidStartAddress')
    }

    if (this._count > 0x7D0) {
      throw new Error('InvalidQuantity')
    }
  }

  /** Start Address. */
  get start () {
    return this._start
  }

  /** Coil Quantity. */
  get count () {
    return this._count
  }

  get name () {
    return 'ReadCoils'
  }

  createPayload () {
    let payload = Buffer.alloc(5)

    payload.writeUInt8(this._fc, 0) // function code
    payload.writeUInt16BE(this._start, 1) // start address
    payload.writeUInt16BE(this._count, 3) // Quantitiy of coils

    return payload
  }

  /** Returns the byte count of this request for the byte representation.
   * @returns {Number}
   */
  get byteCount () {
    return 5
  }
}

module.exports = ReadCoilsRequestBody
