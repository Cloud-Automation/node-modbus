let ModbusResponseBody = require('./response-body.js')

/** WriteMultipleRegisters Respone Body (Function code 0x10)
 * @extends ModbusResponseBody
 * @class
 */
class WriteMultipleRegistersResponseBody extends ModbusResponseBody {

  static fromBuffer (buffer) {
    let start = buffer.readUInt16BE(0)
    let quantity = buffer.readUInt16BE(2)

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
