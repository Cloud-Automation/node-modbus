import { FC } from '../codes'
import ModbusRequestBody from './request-body.js'

/** Read Holding Registers Request Body
 * @extends ModbusRequestBody
 */
export default class ReadHoldingRegistersRequestBody extends ModbusRequestBody {

  /** Start Address. */
  get start () {
    return this._start
  }

  /** Quantity of registers. */
  get count () {
    return this._count
  }

  get byteCount () {
    return 5
  }

  get name () {
    return 'ReadHoldingRegisters' as const
  }

  public static fromBuffer (buffer: Buffer) {
    try {
      const fc = buffer.readUInt8(0)
      const start = buffer.readUInt16BE(1)
      const count = buffer.readUInt16BE(3)

      if (fc !== FC.READ_HOLDING_REGISTERS) {
        return null
      }

      return new ReadHoldingRegistersRequestBody(start, count)
    } catch (e) {
      return null
    }
  }
  private _start: number
  private _count: number

  /** Create a new Read Holding Registers Request Body.
   * @param {Number} start Start Address.
   * @param {Numer} count Quantity of registers to be read.
   * @throws {InvalidStartAddressException} When start address is larger than 0xFFFF.
   * @throws {InvalidQuantityException} When count is larger than 0x7D0.
   */
  constructor (start: number, count: number) {
    super(FC.READ_HOLDING_REGISTERS)
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

export function isReadHoldingRegistersRequestBody (x: any): x is ReadHoldingRegistersRequestBody {
  if (x instanceof ReadHoldingRegistersRequestBody) {
    return true
  } else {
    return false
  }
}
