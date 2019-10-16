import { FC } from '../codes/index.js'
import WriteSingleCoilRequestBody from '../request/write-single-coil.js'
import ModbusWriteResponseBody from './write-response.body.js'

/** Write Single Coil Response Body
 * @extends ModbusResponseBody
 * @class
 */
export default class WriteSingleCoilResponseBody extends ModbusWriteResponseBody {

  get address () {
    return this._address
  }

  get value () {
    return this._value === 0xff00
  }

  get byteCount () {
    return 5
  }

  /** Create WriteSingleCoilResponseBody from Request
   * @param {WriteSingleCoilRequestBody} request
   * @param {Buffer} coil
   * @returns WriteSingleCoilResponseBody
   */
  public static fromRequest (requestBody: WriteSingleCoilRequestBody) {
    const address = requestBody.address
    const value = requestBody.value

    return new WriteSingleCoilResponseBody(address, value)
  }

  /** Creates a WriteSingleResponseBody from a Buffer
   * @param {Buffer} buffer
   * @returns New WriteSingleResponseBody Object
   */
  public static fromBuffer (buffer: Buffer) {
    const fc = buffer.readUInt8(0)
    const address = buffer.readUInt16BE(1)
    const value = buffer.readUInt16BE(3) === 0xFF00

    if (fc !== FC.WRITE_SINGLE_COIL) {
      return null
    }

    return new WriteSingleCoilResponseBody(address, value)
  }
  public _address: number
  public _value: 0 | 0xff00

  constructor (address: number, value: 0 | 0xff00 | boolean) {
    super(FC.WRITE_SINGLE_COIL)
    this._address = address

    this._value = value === 0xFF00 ? 0xFF00 : 0x0000
  }

  public createPayload () {
    const payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt16BE(this._address, 1)
    payload.writeUInt16BE(this._value, 3)

    return payload
  }
}
