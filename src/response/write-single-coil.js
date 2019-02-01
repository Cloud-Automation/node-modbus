const ModbusResponseBody = require('./response-body.js')

/** Write Single Coil Response Body
 * @extends ModbusResponseBody
 * @class
 */
class WriteSingleCoilResponseBody extends ModbusResponseBody {
  /** Create WriteSingleCoilResponseBody from Request
 * @param {WriteSingleCoilRequestBody} request
 * @param {Buffer} coil
 * @returns WriteSingleCoilResponseBody
 */
  static fromRequest (requestBody) {
    const address = requestBody.address
    const value = requestBody.value

    return new WriteSingleCoilResponseBody(address, value)
  }

  /** Creates a WriteSingleResponseBody from a Buffer
   * @param {Buffer} buffer
   * @returns New WriteSingleResponseBody Object
   */
  static fromBuffer (buffer) {
    const fc = buffer.readUInt8(0)
    const address = buffer.readUInt16BE(1)
    const value = buffer.readUInt16BE(3) === 0xFF00

    if (fc !== 0x05) {
      return null
    }

    return new WriteSingleCoilResponseBody(address, value)
  }

  constructor (address, value) {
    super(0x05)
    this._address = address
    this._value = value
  }

  get address () {
    return this._address
  }

  get value () {
    return this._value === 0xff00
  }

  get byteCount () {
    return 5
  }

  createPayload () {
    const payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt16BE(this._address, 1)
    payload.writeUInt16BE(this._value, 3)

    return payload
  }
}

module.exports = WriteSingleCoilResponseBody
