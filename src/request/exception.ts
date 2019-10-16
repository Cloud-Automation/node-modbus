import { ErrorCode, FunctionCode, isFunctionCode } from '../codes'

import ModbusRequestBody from './request-body.js'

/** Write Single Coil Request Body
 * @extends ModbusRequestBody
 */
export default class ExceptionRequestBody extends ModbusRequestBody {

  /** Address to be written */
  get code () {
    return this._code
  }

  get name () {
    return 'ExceptionRequest' as const
  }

  get count () {
    return 0
  }

  /** Returns the byte count of this request for the byte representation.
   * @returns {Number}
   */
  get byteCount () {
    return 2
  }

  get isException () {
    return true
  }

  public static fromBuffer (buffer: Buffer) {
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
  protected _code: ErrorCode

  /** Create a new Exception Request Body.
   * @param {FunctionCode} related function code.
   * @param {ErrorCode} exception code.
   * @throws {InvalidFunctionCodeError} - when the function code is invalid
   */
  constructor (fc: FunctionCode, code: ErrorCode)
  constructor (fc: number, code: ErrorCode)
  constructor (fc: number, code: ErrorCode) {
    if (!isFunctionCode(fc)) {
      throw Error('InvalidFunctionCode')
    }
    super(fc)
    this._code = code
  }

  public createPayload () {
    const payload = Buffer.alloc(2)

    payload.writeUInt8(this._fc, 0) // function code
    payload.writeUInt8(this._code, 1) // code address

    return payload
  }
}

export function isExceptionRequestBody (x: any): x is ExceptionRequestBody {
  if (x instanceof ExceptionRequestBody) {
    return true
  } else {
    return false
  }
}
