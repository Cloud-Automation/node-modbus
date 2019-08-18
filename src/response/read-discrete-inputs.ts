import BufferUtils from '../buffer-utils.js'
import UserRequest from '../user-request.js';
import { BooleanArray } from '../constants/index.js';
import { FC } from '../codes/index.js';
import ReadDiscreteInputsRequestBody from '../request/read-discrete-inputs.js';
import ModbusReadResponseBody from './read-response-body.js';

const {
  bufferToArrayStatus,
  arrayStatusToBuffer
} = BufferUtils;

/** Read Discrete Inputs Response Body (Function Code 0x02)
 * @extends ModbusResponseBody
 * @class
 */
export default class ReadDiscreteInputsResponseBody extends ModbusReadResponseBody {
  private _discrete: BooleanArray | Buffer;
  private _numberOfBytes: number;
  protected _valuesAsArray: BooleanArray;
  protected _valuesAsBuffer: Buffer;

  /** Create ReadDiscreteInputsResponseBody from Request
   * @param {ReadDiscreteInputsRequestBody} request
   * @param {Buffer} discreteInputs
   * @returns ReadDiscreteInputsResponseBody
   */
  static fromRequest(requestBody: ReadDiscreteInputsRequestBody, discreteInputs: Buffer) {
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
  static fromBuffer(buffer: Buffer) {
    try {
      const fc = buffer.readUInt8(0)
      const byteCount = buffer.readUInt8(1)
      const coilStatus = buffer.slice(2, 2 + byteCount)

      if (coilStatus.length !== byteCount) {
        return null
      }

      if (fc !== FC.READ_DISCRETE_INPUT) {
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
  constructor(discrete: BooleanArray | Buffer, numberOfBytes: number) {
    super(FC.READ_DISCRETE_INPUT)
    this._discrete = discrete
    this._numberOfBytes = numberOfBytes

    if (discrete instanceof Array) {
      this._valuesAsArray = discrete
      this._valuesAsBuffer = arrayStatusToBuffer(discrete)
    } else if (discrete instanceof Buffer) {
      this._valuesAsBuffer = discrete
      this._valuesAsArray = bufferToArrayStatus(discrete)
    } else {
      throw new Error('InvalidType_MustBeBufferOrArray');
    }
  }

  /** Coils */
  get discrete() {
    return this._discrete
  }

  get valuesAsArray() {
    return this._valuesAsArray
  }

  get valuesAsBuffer() {
    return this._valuesAsBuffer
  }

  /** Length */
  get numberOfBytes() {
    return this._numberOfBytes
  }

  get byteCount() {
    return this._numberOfBytes + 2
  }

  createPayload() {
    const payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt8(this._numberOfBytes, 1)

    this._valuesAsBuffer.copy(payload, 2)

    return payload
  }
}
