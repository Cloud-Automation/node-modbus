import ReadHoldingRegistersRequestBody from "../request/read-holding-registers";
import { FC } from "../codes";
import ModbusReadResponseBody from './read-response-body.js';
const debug = require('debug')('ReadHoldingRegistersResponseBody')

/** Read Holding Registers ResponseBody (Function Code 0x03)
 * @extends ModbusResponseBody
 * @class
 */
export default class ReadHoldingRegistersResponseBody extends ModbusReadResponseBody {
  private _byteCount: any;
  private _values: number[] | Buffer;
  private _bufferLength: any;
  protected _valuesAsArray!: number[];
  protected _valuesAsBuffer!: Buffer;

  /** Create ReadHoldingRegistersResponseBody from Request
   * @param {ReadHoldingRegistersRequestBody} request
   * @param {Buffer} holdingRegisters
   * @returns ReadHoldingRegistersResponseBody
   */
  static fromRequest(requestBody: ReadHoldingRegistersRequestBody, holdingRegisters: Buffer) {
    const startByte = requestBody.start * 2
    const endByte = (requestBody.start * 2) + (requestBody.count * 2)

    const bufferSegment = holdingRegisters.slice(startByte, endByte)

    /* TODO: check wheather holdingRegisters is big enough for this request */

    return new ReadHoldingRegistersResponseBody(bufferSegment.length, bufferSegment)
  }

  /** Create ReadHoldingRegistersResponseBody from Buffer
   * @param {Buffer} buffer
   * @returns ReadHoldingRegistersResponseBody
   */
  static fromBuffer(buffer: Buffer) {
    const fc = buffer.readUInt8(0)
    const byteCount = buffer.readUInt8(1)
    const payload = buffer.slice(2, 2 + byteCount)

    if (fc !== FC.READ_HOLDING_REGISTERS) {
      return null
    }

    const values = []
    for (let i = 0; i < byteCount; i += 2) {
      values.push(payload.readUInt16BE(i))
    }

    return new ReadHoldingRegistersResponseBody(byteCount, values, payload)
  }

  constructor(byteCount: number, values: number[] | Buffer, payload?: Buffer) {
    super(FC.READ_HOLDING_REGISTERS)
    this._byteCount = byteCount
    this._values = values
    this._bufferLength = 2

    debug('ReadHoldingRegistersResponseBody values', values)

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

  get byteCount() {
    return this._bufferLength
  }

  get values() {
    return this._values
  }

  get valuesAsArray() {
    return this._valuesAsArray
  }

  get valuesAsBuffer() {
    return this._valuesAsBuffer
  }

  get length() {
    return this._values.length
  }

  createPayload() {
    if (this._values instanceof Buffer) {
      let payload = Buffer.alloc(2)
      payload.writeUInt8(this._fc, 0)
      payload.writeUInt8(this._byteCount, 1)
      payload = Buffer.concat([payload, this._values])
      return payload
    }

    if (this._values instanceof Array) {
      const payload = Buffer.alloc(this.byteCount)
      payload.writeUInt8(this._fc, 0)
      payload.writeUInt8(this._byteCount, 1)
      this._values.forEach(function (value, i) {
        payload.writeUInt8(value, 2 + i)
      })

      return payload
    }

    throw new Error('InvalidType_MustBeBufferOrArray')
  }
}
