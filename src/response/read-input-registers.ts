const ModbusResponseBody = require('./response-body.js')

/** Read Input Registers Response Body (Function Code 0x04)
 * @extends ModbusResponseBody
 * @class
 */
class ReadInputRegistersResponseBody extends ModbusResponseBody {
	public _byteCount: any;
	public _values: any;
	public _bufferLength: any;
	public _valuesAsArray: any;
	public _valuesAsBuffer: any;
	public _fc: any;

  /** Create ReadInputRegistersResponseBody from Request
   * @param {ReadInputRegistersRequestBody} request
   * @param {Buffer} inputRegisters
   * @returns ReadInputRegistersResponseBody
   */
  static fromRequest (requestBody, inputRegisters) {
    const startByte = requestBody.start * 2
    const endByte = startByte + (requestBody.count * 2)

    const buf = inputRegisters.slice(startByte, endByte)

    return new ReadInputRegistersResponseBody(buf.length, buf)
  }

  /** Create ReadInputRegistersResponseBody from Buffer
   * @param {Buffer} buffer
   * @returns ReadInputRegistersResponseBody
   */
  static fromBuffer (buffer) {
    const fc = buffer.readUInt8(0)
    const byteCount = buffer.readUInt8(1)
    const payload = buffer.slice(2, 2 + byteCount)

    if (fc !== 0x04) {
      return null
    }

    const values = []
    for (let i = 0; i < byteCount; i += 2) {
      values.push(payload.readUInt16BE(i))
    }

    return new ReadInputRegistersResponseBody(byteCount, values, payload)
  }

  constructor (byteCount, values, payload?) {
    super(0x04)
    this._byteCount = byteCount
    this._values = values
    this._bufferLength = 2

    if (values instanceof Array) {
      this._valuesAsArray = values
      this._bufferLength += values.length * 2
    }

    if (values instanceof Buffer) {
      this._valuesAsBuffer = values
      this._bufferLength += values.length
    }

    if (payload !== undefined && payload instanceof Buffer) {
      this._valuesAsBuffer = payload
    }
  }

  get byteCount () {
    return this._bufferLength
  }

  get values () {
    return this._values
  }

  get valuesAsArray () {
    return this._valuesAsArray
  }

  get valuesAsBuffer () {
    return this._valuesAsBuffer
  }

  get length () {
    return this._values.length
  }

  createPayload () {
    const payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt8(this.length, 1)
    this._values.forEach(function (value, i) {
      payload.writeUInt8(value, 2 + i)
    })

    return payload
  }
}

module.exports = ReadInputRegistersResponseBody
