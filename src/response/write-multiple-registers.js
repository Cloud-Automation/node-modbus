let ModbusResponseBody = require('./response-body.js')

/** WriteMultipleRegisters Respone Body (Function code 0x10)
 * @extends ModbusResponseBody
 * @class
 */
class WriteMultipleRegistersResponseBody extends ModbusResponseBody {

/** Create WriteMultipleRegisterResponseBody from Request
* @param {WriteMultipleRegistersRequestBody} request
* @param {Buffer} coil
* @returns WriteMultipleRegisterResponseBody
*/
  static fromRequest (requestBody) {

    let start = requestBody.address
    let quantity = requestBody.quantity

    return new WriteMultipleRegistersResponseBody(start, quantity)
  }

  static fromBuffer (buffer) {
    let fc = buffer.readUInt8(0)
    let start = buffer.readUInt16BE(1)
    let quantity = buffer.readUInt16BE(3)

    if (fc !== 0x10) {
      return null
    }

    return new WriteMultipleRegistersResponseBody(start, quantity)
  }

  constructor (start, quantity) {
    super(0x10)
    this._start = start
    this._quantity = quantity
  }

  get start () {
    return this._start
  }

  get quantity () {
    return this._quantity
  }

  get byteCount () {
    return 5
  }

  createPayload () {
    let payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt16BE(this._start, 1)
    payload.writeUInt16BE(this._quantity, 3)

    return payload
  }
}

module.exports = WriteMultipleRegistersResponseBody
