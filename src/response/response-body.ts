

import { isFunctionCode, FunctionCode } from "../codes";
import ModbusRequestBody from "../request/request-body";

/** Modbus Response Body
 * @abstract
 */
export default abstract class ModbusBaseResponseBody {
  protected _fc: FunctionCode;

  /** Create new ModbusResponseBody
   * @param {FunctionCode} fc Function Code
   * @throws {InvalidFunctionCode}
   */
  constructor(fc: FunctionCode, ignoreInvalidFunctionCode = false) {
    if (ignoreInvalidFunctionCode === false) {
      if (!isFunctionCode(fc)) {
        throw Error('InvalidFunctionCode')
      }
    }

    this._fc = fc
  }

  public static fromRequest(requestBody: ModbusRequestBody, buf: Buffer): any {
    throw new Error('Cannot call from request from abstract class')
  };

  /** Function Code */
  get fc() {
    return this._fc
  }

  /** Number of bytes for the payload.  */
  abstract get byteCount(): number;

  /** Create payload to be send over a socket.
   * @returns {Buffer}
   */
  abstract createPayload(): Buffer;

  get isException(): boolean {
    return false;
  }

}