let Messages = {
  0x01: 'ILLEGAL FUNCTION',
  0x02: 'ILLEGAL DATA ADDRESS',
  0x03: 'ILLEGAL DATA VALUE',
  0x04: 'SLAVE DEVICE FAILURE',
  0x05: 'ACKNOWLEDGE',
  0x06: 'SLAVE DEVICE BUSY',
  0x08: 'MEMORY PARITY ERROR',
  0x0A: 'GATEWAY PATH UNAVAILABLE',
  0x0B: 'GATEWAY TARGET DEVICE FAILED TO RESPOND'
}

let ModbusResponseBody = require('./response-body.js')

/** Modbus Excepiton Response Body
 * @extends ModbusResponseBody
 * @class
 */
class ExceptionResponseBody extends ModbusResponseBody {

  /** Create Exception Response from buffer.
   * @param {Number} fc Function Code
   * @param {Buffer} buffer Buffer
   * @returns {ExceptionResponseBody}
   */
  static fromBuffer (buffer) {
    let fc = buffer.readUInt8(0)
    let code = buffer.readUInt8(1)
    return new ExceptionResponseBody(fc - 0x80, code)
  }

  /** Create ExceptionResponseBody
   * @param {Number} fc Function Code
   * @param {Number} code Exception Code
   */
  constructor (fc, code) {
    super(fc)
    this._code = code
  }

  /** Exception Code */
  get code () {
    return this._code
  }

  /** Exception message */
  get message () {
    return Messages[this._code]
  }

  get byteCount () {
    return 2
  }

  createPayload () {
    let payload = Buffer.alloc(2)
    payload.writeUInt8(this._fc, 0)
    payload.writeUInt8(this._code, 1)
    return payload
  }

}

module.exports = ExceptionResponseBody
