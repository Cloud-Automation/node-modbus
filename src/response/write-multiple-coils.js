let ModbusResponseBody = require('./response-body.js')

/** WriteMultipleCoils Response Body (Function Code 0x0f)
 * @extends ModbusResponseBody
 * @class
 */
class WriteMultipleCoilsResponseBody extends ModbusResponseBody {

  /** Create WriteMultipleCoilsResponseBody from Request
  * @param {WriteMultipleCoilsRequestBody} request
  * @param {Buffer} coil
  * @returns WriteMultipleCoilsResponseBody
  */
  static fromRequest (requestBody) {

    let start = requestBody.address
    let quantity = requestBody.quantity

    return new WriteMultipleCoilsResponseBody(start, quantity)
  }
  
  static fromBuffer (buffer) {
    let fc = buffer.readUInt8(0)
    let start = buffer.readUInt16BE(1)
    let quantity = buffer.readUInt16BE(3)

    if (fc !== 0x0f) {
      return null
    }

    return new WriteMultipleCoilsResponseBody(start, quantity)
  }

  constructor (start, quantity) {
    super(0x0F)
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

module.exports = WriteMultipleCoilsResponseBody
