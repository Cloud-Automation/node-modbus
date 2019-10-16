import { FC } from '../codes'
import ModbusRequestBody from './request-body.js'

/** Write Single Register Request Body
 * @extends ModbusRequestBody
 */
export default class WriteSingleRegisterRequestBody extends ModbusRequestBody {

  /** Address to be written. */
  get address () {
    return this._address
  }

  /** Value to be written. */
  get value () {
    return this._value
  }

  get name () {
    return 'WriteSingleRegister' as const
  }

  get quantity () {
    return 1
  }

  get count () {
    return 1
  }

  get byteCount () {
    return 5
  }

  public static fromBuffer (buffer: Buffer) {
    try {
      const fc = buffer.readUInt8(0)
      const address = buffer.readUInt16BE(1)
      const value = buffer.readUInt16BE(3)

      if (fc !== FC.WRITE_SINGLE_HOLDING_REGISTER) {
        return null
      }

      return new WriteSingleRegisterRequestBody(address, value)
    } catch (e) {
      return null
    }
  }
  private _address: number
  private _value: number

  /** Create a new Write Single Register Request Body.
   * @param {number} address Write address.
   * @param {number} value Value to be written.
   * @throws {InvalidStartAddressException} When address is larger than 0xFFFF.
   */
  constructor (address: number, value: number) {
    super(FC.WRITE_SINGLE_HOLDING_REGISTER)
    if (address > 0xFFFF) {
      throw new Error('InvalidStartAddress')
    }
    if (!Number.isInteger(value) || value < 0 || value > 0xFFFF) {
      throw new Error('InvalidValue')
    }
    this._address = address
    this._value = value
  }

  public createPayload () {
    const payload = Buffer.alloc(5)
    payload.writeUInt8(this._fc, 0) // function code
    payload.writeUInt16BE(this._address, 1) // output address
    payload.writeUInt16BE(this._value, 3) // output value
    return payload
  }
}

export function isWriteSingleRegisterRequestBody (x: any): x is WriteSingleRegisterRequestBody {
  if (x instanceof WriteSingleRegisterRequestBody) {
    return true
  } else {
    return false
  }
}
