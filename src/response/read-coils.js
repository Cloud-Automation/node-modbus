let debug = require('debug')('read-coils-response')
let ModbusResponseBody = require('./response-body.js')

/** Read Coils Response Body
 * @extends ModbusResponseBody
 * @class
 */
class ReadCoilsResponseBody extends ModbusResponseBody {

  /** Creates a response body from a request body and
   * the coils buffer
   * @param {ReadCoilsRequestBody} request
   * @param {Buffer} coils
   * @returns {ReadCoilsResponseBody}
   */
  static fromRequest (requestBody, coils) {

    let startByte = Math.floor(requestBody.start / 8)
    let endByte = Math.ceil((requestBody.start + requestBody.count) / 8)

    let bufferSegment = coils.slice(startByte, endByte)
    let buf = Buffer.from(bufferSegment)

    let end = (requestBody.start + requestBody.count) / 8
    let zeroShift = (endByte - end) * 8

    buf[endByte - 1] = buf[endByte - 1] >>> zeroShift

    return new ReadCoilsResponseBody(buf, buf.length)
  }

  /** Create ReadCoilsResponseBody from buffer.
   * @param {Buffer} buffer
   * @returns {ReadCoilsResponseBody} Returns Null of not enough data located in the buffer.
   */
  static fromBuffer (buffer) {
    try {
      let fc = buffer.readUInt8(0)
      let byteCount = buffer.readUInt8(1)
      let coilStatus = buffer.slice(2, 2 + byteCount)

      if (coilStatus.length !== byteCount) {
        return null
      }

      if (fc !== 0x01) {
        return null
      }

      return new ReadCoilsResponseBody(coilStatus, byteCount)
    } catch (e) {
      debug('no valid read coils response body in the buffer yet')
      return null
    }
  }

  /** Create new ReadCoilsResponseBody
   * @param [Array] coils Array of Boolean.
   * @param [Number] length
   */
  constructor (coils, numberOfBytes) {
    super(0x01)
    this._coils = coils
    this._numberOfBytes = numberOfBytes

    if (coils instanceof Array) {
      this._valuesAsArray = coils
      this._valuesAsBuffer = Buffer.alloc(numberOfBytes)
      for (let i = 0; i < coils.length; i += 1) {
        let byteOffset = Math.floor(i / 8)
        let bitOffset = i % 8
        let byte = this._valuesAsBuffer.readUInt8(byteOffset)

        byte += coils[i] ? Math.pow(2, bitOffset) : 0

        this._valuesAsBuffer.writeUInt8(byte, byteOffset)
      }
    }

    if (coils instanceof Buffer) {
      this._valuesAsBuffer = coils
      this._valuesAsArray = []
      for (let i = 0; i < coils.length * 8; i += 1) {
        let byteOffset = Math.floor(i / 8)
        let bitOffset = i % 8
        let mask = Math.pow(2, bitOffset)
        let byte = this._valuesAsBuffer.readUInt8(byteOffset)
        let value = ((byte & mask) > 0) ? 1 : 0
        this._valuesAsArray.push(value)
      }
    }
  }

  /** Coils */
  get values () {
    return this._coils
  }

  get valuesAsArray () {
    return this._valuesAsArray
  }

  get valuesAsBuffer () {
    return this._valuesAsBuffer
  }

  /** Length */
  get numberOfBytes () {
    return this._numberOfBytes
  }

  get byteCount () {
    return this._numberOfBytes + 2
  }

  createPayload () {
    let payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt8(this._numberOfBytes, 1)

    this._valuesAsBuffer.copy(payload, 2)

    return payload
  }

}

module.exports = ReadCoilsResponseBody
