import { FC } from '../codes/index.js'
import WriteSingleRegisterRequestBody from '../request/write-single-register.js'
import ModbusWriteResponseBody from './write-response.body.js'

/** WriteSingleRegister Resonse Body (Function code 0x05)
 * @extends ModbusResponseBody
 * @class
 */
export default class WriteSingleRegisterResponseBody extends ModbusWriteResponseBody {

  get address () {
    return this._address
  }

  get value () {
    return this._value
  }

  get byteCount () {
    return 5
  }

  /** Create WriteSingleRegisterResponseBody from Request
   * @param {WriteSingleRegisterRequestBody} request
   * @param {Buffer} coil
   * @returns WriteSingleRegisterResponseBody
   */
  public static fromRequest (requestBody: WriteSingleRegisterRequestBody) {
    const address = requestBody.address
    const value = requestBody.value

    return new WriteSingleRegisterResponseBody(address, value)
  }

  public static fromBuffer (buffer: Buffer) {
    const fc = buffer.readUInt8(0)
    const address = buffer.readUInt16BE(1)
    const value = buffer.readUInt16BE(3)

    if (fc !== FC.WRITE_SINGLE_HOLDING_REGISTER) {
      return null
    }

    return new WriteSingleRegisterResponseBody(address, value)
  }
  private _address: number
  private _value: number

  constructor (address: number, value: number) {
    super(FC.WRITE_SINGLE_HOLDING_REGISTER)
    this._address = address
    this._value = value
  }

  public createPayload () {
    const payload = Buffer.alloc(5)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt16BE(this._address, 1)
    payload.writeUInt16BE(this._value, 3)

    return payload
  }
}
