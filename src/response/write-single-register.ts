const ModbusResponseBody = require('./response-body.js')

/** WriteSingleRegister Resonse Body (Function code 0x05)
 * @extends ModbusResponseBody
 * @class
 */
class WriteSingleRegisterResponseBody extends ModbusResponseBody {
	public _address: any;
	public _value: any;
	public _fc: any;

 /** Create WriteSingleRegisterResponseBody from Request
 * @param {WriteSingleRegisterRequestBody} request
 * @param {Buffer} coil
 * @returns WriteSingleRegisterResponseBody
 */
  static fromRequest (requestBody) {
    const address = requestBody.address
    const value = requestBody.value

    return new WriteSingleRegisterResponseBody(address, value)
  }

  static fromBuffer (buffer) {
    const fc = buffer.readUInt8(0)
    const address = buffer.readUInt16BE(1)
    const value = buffer.readUInt16BE(3)

    if (fc !== 0x06) {
      return null
    }

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
    const payload = Buffer.alloc(5)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt16BE(this._address, 1)
    payload.writeUInt16BE(this._value, 3)

    return payload
  }
}

module.exports = WriteSingleRegisterResponseBody
