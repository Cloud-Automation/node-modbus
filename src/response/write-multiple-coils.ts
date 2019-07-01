const ModbusResponseBody = require('./response-body.js')

/** WriteMultipleCoils Response Body (Function Code 0x0f)
 * @extends ModbusResponseBody
 * @class
 */
class WriteMultipleCoilsResponseBody extends ModbusResponseBody {
	public _start: any;
	public _quantity: any;
	public _fc: any;

  /** Create WriteMultipleCoilsResponseBody from Request
  * @param {WriteMultipleCoilsRequestBody} request
  * @param {Buffer} coil
  * @returns WriteMultipleCoilsResponseBody
  */
  static fromRequest (requestBody) {
    const start = requestBody.address
    const quantity = requestBody.quantity

    return new WriteMultipleCoilsResponseBody(start, quantity)
  }

  static fromBuffer (buffer) {
    const fc = buffer.readUInt8(0)
    const start = buffer.readUInt16BE(1)
    const quantity = buffer.readUInt16BE(3)

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
    const payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt16BE(this._start, 1)
    payload.writeUInt16BE(this._quantity, 3)

    return payload
  }
}

module.exports = WriteMultipleCoilsResponseBody
