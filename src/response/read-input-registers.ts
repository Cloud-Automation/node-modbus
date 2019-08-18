import ReadInputRegistersRequestBody from '../request/read-input-registers.js';
import { FC } from '../codes/index.js';
import ModbusReadResponseBody from './read-response-body.js';

/** Read Input Registers Response Body (Function Code 0x04)
 * @extends ModbusResponseBody
 * @class
 */
export default class ReadInputRegistersResponseBody extends ModbusReadResponseBody {
  private _byteCount: number;
  private _values: number[] | Uint16Array | Buffer;
  private _bufferLength: number;
  protected _valuesAsArray: number[] | Uint16Array;
  protected _valuesAsBuffer: Buffer;

  /** Create ReadInputRegistersResponseBody from Request
   * @param {ReadInputRegistersRequestBody} request
   * @param {Buffer} inputRegisters
   * @returns ReadInputRegistersResponseBody
   */
  static fromRequest(requestBody: ReadInputRegistersRequestBody, inputRegisters: Buffer) {
    const startByte = requestBody.start * 2
    const endByte = startByte + (requestBody.count * 2)

    const buf = inputRegisters.slice(startByte, endByte)

    return new ReadInputRegistersResponseBody(buf.length, buf)
  }

  /** Create ReadInputRegistersResponseBody from Buffer
   * @param {Buffer} buffer
   * @returns ReadInputRegistersResponseBody
   */
  static fromBuffer(buffer: Buffer) {
    const fc = buffer.readUInt8(0)
    const byteCount = buffer.readUInt8(1)
    const payload = buffer.slice(2, 2 + byteCount)

    if (fc !== FC.READ_INPUT_REGISTERS) {
      return null
    }

    const values = []
    for (let i = 0; i < byteCount; i += 2) {
      values.push(payload.readUInt16BE(i))
    }

    return new ReadInputRegistersResponseBody(byteCount, values, payload)
  }

  constructor(byteCount: number, values: number[] | Uint16Array | Buffer, payload?: Buffer) {
    super(FC.READ_INPUT_REGISTERS)
    this._byteCount = byteCount
    this._values = values
    this._bufferLength = 2

    if (values instanceof Array) {
      this._valuesAsArray = values
      this._valuesAsBuffer = Buffer.from(values)
      this._bufferLength += values.length * 2
    } else if (values instanceof Buffer) {
      this._valuesAsArray = Uint16Array.from(values)
      this._valuesAsBuffer = values
      this._bufferLength += values.length
    } else {
      throw new Error('InvalidType_MustBeBufferOrArray');
    }

    if (payload instanceof Buffer) {
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
    const payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt8(this.length, 1)
    this._values.forEach(function (value: number, i: number) {
      payload.writeUInt8(value, 2 + i)
    })

    return payload
  }
}
