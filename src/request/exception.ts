import { isFunctionCode, ErrorCode, FunctionCode } from "../codes";

import ModbusRequestBody from './request-body.js'

/** Write Single Coil Request Body
 * @extends ModbusRequestBody
 */
export default class ExceptionRequestBody extends ModbusRequestBody {
  protected _code: ErrorCode;

  static fromBuffer(buffer: Buffer) {
    try {
      const fc = buffer.readUInt8(0)

      if (fc > 0x2B) {
        return null
      }

      return new ExceptionRequestBody(fc, 0x01)
    } catch (e) {
      return null
    }
  }

  /** Create a new Exception Request Body.
   * @param {FunctionCode} related function code.
   * @param {ErrorCode} exception code.
   * @throws {InvalidFunctionCodeError} - when the function code is invalid
   */
  constructor(fc: FunctionCode, code: ErrorCode)
  constructor(fc: number, code: ErrorCode)
  constructor(fc: number, code: ErrorCode) {
    if (!isFunctionCode(fc)) {
      throw Error('InvalidFunctionCode')
    }
    super(fc)
    this._code = code
  }

  /** Address to be written */
  get code() {
    return this._code
  }

  createPayload() {
    const payload = Buffer.alloc(2)

    payload.writeUInt8(this._fc, 0) // function code
    payload.writeUInt8(this._code, 1) // code address

    return payload
  }

  get name() {
    return 'ExceptionRequest' as const
  }

  get count() {
    return 0;
  }

  /** Returns the byte count of this request for the byte representation.
   * @returns {Number}
   */
  get byteCount() {
    return 2
  }

  get isException() {
    return true;
  }
}

export function isExceptionRequestBody(x: any): x is ExceptionRequestBody {
  if (x instanceof ExceptionRequestBody) {
    return true;
  } else {
    return false;
  }
}