let ModbusRequestBody = require('./request-body.js')

/** Write Single Coil Request Body
 * @extends ModbusRequestBody
 */
class WriteSingleCoilRequestBody extends ModbusRequestBody {

  /** Create a new Write Single Coil Request Body.
   * @param {Number} address Write address.
   * @param {Boolean} value Value to be written.
   * @throws {InvalidStartAddressException} When address is larger than 0xFFFF.
   */
  constructor (address, value) {
    super(0x05)
    if (address > 0xFFFF) {
      throw new Error('InvalidStartAddress')
    }
    this._address = address
    this._value = value
  }

  /** Address to be written */
  get address () {
    return this._address
  }

  /** Value to be written */
  get value () {
    return this._value ? 0xFF00 : 0x0000
  }

  get byteCount () {
    return 5
  }

  createPayload () {
    let payload = Buffer.alloc(5)

    payload.writeUInt8(this._fc, 0) // function code
    payload.writeUInt16BE(this._address, 1) // output address
    payload.writeUInt16BE(this._value ? 0xFF00 : 0x0000, 3) // output value

    return payload
  }

}

module.exports = WriteSingleCoilRequestBody
