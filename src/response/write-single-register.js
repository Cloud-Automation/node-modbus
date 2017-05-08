let ModbusResponseBody = require('./response-body.js')

/** WriteSingleRegister Resonse Body (Function code 0x05)
 * @extends ModbusResponseBody
 * @class
 */
class WriteSingleRegisterResponseBody extends ModbusResponseBody {
  static fromBuffer (buffer) {
    let address = buffer.readUInt16BE(0)
    let value = buffer.readUInt16BE(2)

    return new WriteSingleRegisterResponseBody(address, value)
  }

  constructor (address, value) {
    super(0x06)
    this._address = address
    this._value = value
  }

  get address () {
    return this._address
  }

  get value () {
    return this._value
  }

  get byteCount () {
    return 5
  }

  createPayload () {
    let payload = Buffer.alloc(5)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt16BE(this._address, 1)
    payload.writeUInt16BE(this._value, 3)

    return payload
  }
}

module.exports = WriteSingleRegisterResponseBody
