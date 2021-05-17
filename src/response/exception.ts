import {
  ErrorCode,
  errorCodeToMessage,
  FunctionCode,
  isFunctionCode
} from '../codes'
import ExceptionRequestBody from '../request/exception.js'
import ModbusRequestBody from '../request/request-body.js'
import ModbusResponseBody from './response-body.js'

/** Modbus Excepiton Response Body
 * @extends ModbusResponseBody
 * @class
 */
export default class ExceptionResponseBody extends ModbusResponseBody {

  /** Exception Code */
  get code () {
    return this._code
  }

  /** Exception message */
  get message () {
    return errorCodeToMessage(this._code)
  }

  get byteCount () {
    return 2
  }

  get isException (): boolean {
    return true
  }

  /** Create Exception Response from buffer.
   * @param {Buffer} buffer Buffer
   * @returns {ExceptionResponseBody}
   */
  public static fromBuffer (buffer: Buffer) {
    const fc = buffer.readUInt8(0) - 0x80
    const code = buffer.readUInt8(1) as ErrorCode

    if (!isFunctionCode(fc)) {
      throw Error('InvalidFunctionCode')
    }
    return new ExceptionResponseBody(fc, code)
  }

  // TODO: Figure out what type the requestBody is
  public static fromRequest (requestBody: ExceptionRequestBody) {
    return new ExceptionResponseBody(requestBody.fc, requestBody.code)
  }
  private _code: ErrorCode

  /** Create ExceptionResponseBody
   * @param {FunctionCode} fc Function Code
   * @param {ErrorCode} code Exception Code
   */
  constructor (fc: FunctionCode, code: ErrorCode) {
    const ignoreInvalidFunctionCode = true
    super(fc, ignoreInvalidFunctionCode)
    this._code = code
  }

  public createPayload () {
    const payload = Buffer.alloc(2)
    // This is a exception Response
    // Add 0x80 for compatibility (crc check)
    payload.writeUInt8(this._fc + 0x80, 0)
    payload.writeUInt8(this._code, 1)
    return payload
  }
}

export function isExceptionResponseBody (x: any): x is ExceptionResponseBody {
  if (x instanceof ExceptionResponseBody) {
    return true
  } else {
    return false
  }
}
