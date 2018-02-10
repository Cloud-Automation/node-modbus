let ModbusRequestBody = require('./request-body.js')

/** Write Single Coil Request Body
 * @extends ModbusRequestBody
 */
class ExceptionRequestBody extends ModbusRequestBody {
  static fromBuffer (buffer) {
    try {
      let fc = buffer.readUInt8(0)

      if (fc > 0x2B) {
        return null
      }

      return new ExceptionRequestBody(fc, 0x01)
    } catch (e) {
      return null
    }
  }

  /** Create a new Exception Request Body.
   * @param {fc} related function code.
   * @param {code} exception code.
   */
  constructor (fc, code) {
    super(fc + 0x80)
    this._code = code
  }

  /** Address to be written */
  get code () {
    return this._code
  }

  createPayload () {
    let payload = Buffer.alloc(2)

    payload.writeUInt8(this._fc, 0) // function code
    payload.writeUInt8(this._code, 1) // code address

    return payload
  }
}

module.exports = ExceptionRequestBody
