'use strict'

/** Modbus Response Body
 * @abstract
 */
abstract class ModbusResponseBody {
  public _fc: FunctionCode;

  static fromBuffer(buffer: Buffer) {
    const ReadCoilsResponse = require('./read-coils.js')

    try {
      const fc = buffer.readUInt8(0)

      if (fc === 0x01) {
        return ReadCoilsResponse.fromBuffer(buffer)
      }

      return null
    } catch (e) {
      return null
    }
  }

  /** Create new ModbusResponseBody
   * @param {FunctionCode} fc Function Code
   */
  constructor(fc: FunctionCode) {
    if (new.target === ModbusResponseBody) {
      throw new TypeError('Cannot instantiate ModbusResponseBody directly.')
    }
    this._fc = fc
  }

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
}

export = ModbusResponseBody
