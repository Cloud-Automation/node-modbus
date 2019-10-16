import { FC } from '../codes/index.js'
import ModbusRequestBody from './request-body.js'

/** Write Single Coil Request Body
 * @extends ModbusRequestBody
 */
export default class WriteSingleCoilRequestBody extends ModbusRequestBody {

  /** Address to be written */
  get address () {
    return this._address
  }

  /** Value to be written */
  get value () {
    return this._value ? 0xFF00 : 0x0000
  }

  get byteCount () {
    return 5
  }

  get count () {
    return 1
  }

  get name () {
    return 'WriteSingleCoil' as const
  }

  public static fromBuffer (buffer: Buffer) {
    try {
      const fc = buffer.readUInt8(0)
      const address = buffer.readUInt16BE(1)
      const value = buffer.readUInt16BE(3) === 0xff00

      if (fc !== FC.WRITE_SINGLE_COIL) {
        return null
      }

      return new WriteSingleCoilRequestBody(address, value)
    } catch (e) {
      return null
    }
  }
  private _address: number
  private _value: boolean | 0 | 1

  /** Create a new Write Single Coil Request Body.
   * @param {number} address Write address.
   * @param {boolean | 0 | 1} value Value to be written.
   * @throws {InvalidStartAddressException} When address is larger than 0xFFFF.
   */
  constructor (address: number, value: boolean | 0 | 1) {
    super(FC.WRITE_SINGLE_COIL)
    if (address > 0xFFFF) {
      throw new Error('InvalidStartAddress')
    }
    this._address = address
    this._value = value
  }

  public createPayload () {
    const payload = Buffer.alloc(5)

    payload.writeUInt8(this._fc, 0) // function code
    payload.writeUInt16BE(this._address, 1) // output address
    payload.writeUInt16BE(this._value ? 0xFF00 : 0x0000, 3) // output value

    return payload
  }
}

export function isWriteSingleCoilRequestBody (x: any): x is WriteSingleCoilRequestBody {
  if (x instanceof WriteSingleCoilRequestBody) {
    return true
  } else {
    return false
  }
}
