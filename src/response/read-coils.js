const debug = require('debug')('read-coils-response')
const ModbusResponseBody = require('./response-body.js')
const {
  bufferToArrayStatus,
  arrayStatusToBuffer
} = require('../buffer-utils.js')

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
    const coilsStatus = bufferToArrayStatus(coils)

    const start = requestBody.start
    const end = start + requestBody.count

    // Extract the segment of coils status
    const coilsSegment = coilsStatus.slice(start, end)

    return new ReadCoilsResponseBody(coilsSegment, Math.ceil(coilsSegment.length / 8))
  }

  /** Create ReadCoilsResponseBody from buffer.
   * @param {Buffer} buffer
   * @returns {ReadCoilsResponseBody} Returns Null of not enough data located in the buffer.
   */
  static fromBuffer (buffer) {
    try {
      const fc = buffer.readUInt8(0)
      const byteCount = buffer.readUInt8(1)
      const coilStatus = buffer.slice(2, 2 + byteCount)

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
      this._valuesAsBuffer = arrayStatusToBuffer(coils)
    }

    if (coils instanceof Buffer) {
      this._valuesAsBuffer = coils
      this._valuesAsArray = bufferToArrayStatus(coils)
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
    const payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt8(this._numberOfBytes, 1)

    this._valuesAsBuffer.copy(payload, 2)

    return payload
  }
}

module.exports = ReadCoilsResponseBody
