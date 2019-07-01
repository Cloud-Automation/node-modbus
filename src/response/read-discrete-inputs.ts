const ModbusResponseBody = require('./response-body.js')
const {
  bufferToArrayStatus,
  arrayStatusToBuffer
} = require('../buffer-utils.js')

/** Read Discrete Inputs Response Body (Function Code 0x02)
 * @extends ModbusResponseBody
 * @class
 */
class ReadDiscreteInputsResponseBody extends ModbusResponseBody {
	public _discrete: any;
	public _numberOfBytes: any;
	public _valuesAsArray: any;
	public _valuesAsBuffer: any;
	public _fc: any;

  /** Create ReadDiscreteInputsResponseBody from Request
   * @param {ReadDiscreteInputsRequestBody} request
   * @param {Buffer} discreteInputs
   * @returns ReadDiscreteInputsResponseBody
   */
  static fromRequest (requestBody, discreteInputs) {
    const discreteStatus = bufferToArrayStatus(discreteInputs)

    const start = requestBody.start
    const end = start + requestBody.count

    // Extract the segment of coils status
    const segmentStatus = discreteStatus.slice(start, end)

    return new ReadDiscreteInputsResponseBody(segmentStatus, Math.ceil(segmentStatus.length / 8))
  }

  /** Create ReadDiscreteInputsResponseBody from Buffer
   * @param {Buffer} buffer
   * @returns ReadDiscreteInputsResponseBody
   */
  static fromBuffer (buffer) {
    try {
      const fc = buffer.readUInt8(0)
      const byteCount = buffer.readUInt8(1)
      const coilStatus = buffer.slice(2, 2 + byteCount)

      if (coilStatus.length !== byteCount) {
        return null
      }

      if (fc !== 0x02) {
        return null
      }

      return new ReadDiscreteInputsResponseBody(coilStatus, byteCount)
    } catch (e) {
      return null
    }
  }

  /** Creates a ReadDiscreteInputsResponseBody
   * @param {Array} discrete Array with Boolean values
   * @param {Number} length Quantity of Coils
   */
  constructor (discrete, numberOfBytes) {
    super(0x02)
    this._discrete = discrete
    this._numberOfBytes = numberOfBytes

    if (discrete instanceof Array) {
      this._valuesAsArray = discrete
      this._valuesAsBuffer = arrayStatusToBuffer(discrete)
    }

    if (discrete instanceof Buffer) {
      this._valuesAsBuffer = discrete
      this._valuesAsArray = bufferToArrayStatus(discrete)
    }
  }

  /** Coils */
  get discrete () {
    return this._discrete
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
module.exports = ReadDiscreteInputsResponseBody
