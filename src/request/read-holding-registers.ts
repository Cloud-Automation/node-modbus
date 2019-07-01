const ModbusRequestBody = require('./request-body.js')

/** Read Holding Registers Request Body
 * @extends ModbusRequestBody
 */
class ReadHoldingRegistersRequestBody extends ModbusRequestBody {
	public _start: any;
	public _count: any;
	public _fc: any;

  static fromBuffer (buffer) {
    try {
      const fc = buffer.readUInt8(0)
      const start = buffer.readUInt16BE(1)
      const count = buffer.readUInt16BE(3)

      if (fc !== 0x03) {
        return null
      }

      return new ReadHoldingRegistersRequestBody(start, count)
    } catch (e) {
      return null
    }
  }

  /** Create a new Read Holding Registers Request Body.
   * @param {Number} start Start Address.
   * @param {Numer} count Quantity of registers to be read.
   * @throws {InvalidStartAddressException} When start address is larger than 0xFFFF.
   * @throws {InvalidQuantityException} When count is larger than 0x7D0.
   */
  constructor (start, count) {
    super(0x03)
    if (start > 0xFFFF) {
      throw new Error('InvalidStartAddress')
    }
    if (count > 0x7D0) {
      throw new Error('InvalidQuantity')
    }
    this._start = start
    this._count = count
  }

  /** Start Address. */
  get start () {
    return this._start
  }

  /** Quantity of registers. */
  get count () {
    return this._count
  }

  get byteCount () {
    return 5
  }

  get name () {
    return 'ReadHoldingRegisters'
  }

  createPayload () {
    const payload = Buffer.alloc(5)
    payload.writeUInt8(this._fc, 0) // function code
    payload.writeUInt16BE(this._start, 1) // start address
    payload.writeUInt16BE(this._count, 3) // quantitiy of coils
    return payload
  }
}

module.exports = ReadHoldingRegistersRequestBody
