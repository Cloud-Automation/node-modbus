import ModbusRequestBody from './request-body.js';
import { FC } from '../codes/index.js';

/** Read Coils Request Body
 * @extends ModbusRequestBody
 */
export default class ReadCoilsRequestBody extends ModbusRequestBody {
  private _start: number;
  private _count: number;

  static fromBuffer(buffer: Buffer) {
    try {
      const fc = buffer.readUInt8(0)

      if (fc !== FC.READ_COIL) {
        return null
      }

      const start = buffer.readUInt16BE(1)
      const quantity = buffer.readUInt16BE(3)

      return new ReadCoilsRequestBody(start, quantity)
    } catch (e) {
      return null
    }
  }

  /** Create a new Read Coils Request Body.
   * @param {number} start Start Address.
   * @param {number} count Quantity of coils to be read.
   * @throws {InvalidStartAddressException} When Start address is larger than 0xFFFF.
   * @throws {InvalidQuantityException} When count is larger than 0x7D0.
   */
  constructor(start: number, count: number) {
    super(FC.READ_COIL)
    this._start = start
    this._count = count

    if (this._start > 0xFFFF) {
      throw new Error('InvalidStartAddress')
    }

    if (this._count > 0x7D0) {
      throw new Error('InvalidQuantity')
    }
  }

  /** Start Address. */
  get start() {
    return this._start
  }

  /** Coil Quantity. */
  get count() {
    return this._count
  }

  get name() {
    return 'ReadCoils' as const
  }

  createPayload() {
    const payload = Buffer.alloc(5)

    payload.writeUInt8(this._fc, 0) // function code
    payload.writeUInt16BE(this._start, 1) // start address
    payload.writeUInt16BE(this._count, 3) // Quantitiy of coils

    return payload
  }

  /** Returns the byte count of this request for the byte representation.
   * @returns {Number}
   */
  get byteCount() {
    return 5
  }
}

export function isReadCoilsRequestBody(x: any): x is ReadCoilsRequestBody {
  if (x instanceof ReadCoilsRequestBody) {
    return true;
  } else {
    return false;
  }
}
