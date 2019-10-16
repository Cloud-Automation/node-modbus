import { FC } from '../codes'

import ModbusRequestBody from './request-body.js'

/** Read Input Registers Request Body
 * @extends ModbusRequestBody
 */
export default class ReadInputRegistersRequestBody extends ModbusRequestBody {

  /** Start Address. */
  get start () {
    return this._start
  }

  /** Quantity of registers */
  get count () {
    return this._count
  }

  get name () {
    return 'ReadInputRegisters' as const
  }

  get byteCount () {
    return 5
  }

  public static fromBuffer (buffer: Buffer) {
    try {
      const fc = buffer.readUInt8(0)
      const start = buffer.readUInt16BE(1)
      const count = buffer.readUInt16BE(3)

      if (fc !== FC.READ_INPUT_REGISTERS) {
        return null
      }

      return new ReadInputRegistersRequestBody(start, count)
    } catch (e) {
      return null
    }
  }
  private _start: number
  private _count: number

  /** Create a new Read Input Registers Request Body.
   * @param {number} start Start Address.
   * @param {number} count Quantity of coils to be read.
   * @throws {InvalidStartAddressException} When Start address is larger than 0xFFFF.
   * @throws {InvalidQuantityException} When count is larger than 0x7D0.
   */
  constructor (start: number, count: number) {
    super(FC.READ_INPUT_REGISTERS)
    if (start > 0xFFFF) {
      throw new Error('InvalidStartAddress')
    }
    if (count > 0x7D0) {
      throw new Error('InvalidQuantity')
    }
    this._start = start
    this._count = count
  }

  public createPayload () {
    const payload = Buffer.alloc(5)

    payload.writeUInt8(this._fc, 0) // function code
    payload.writeUInt16BE(this._start, 1) // start address
    payload.writeUInt16BE(this._count, 3) // quantitiy of coils

    return payload
  }
}

export function isReadInputRegistersRequestBody (x: any): x is ReadInputRegistersRequestBody {
  if (x instanceof ReadInputRegistersRequestBody) {
    return true
  } else {
    return false
  }
}
