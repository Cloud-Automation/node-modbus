import { FC } from '../codes'
import WriteMultipleRegistersRequestBody from '../request/write-multiple-registers'

import ModbusWriteResponseBody from './write-response.body'

/** WriteMultipleRegisters Respone Body (Function code 0x10)
 * @extends ModbusResponseBody
 * @class
 */
export default class WriteMultipleRegistersResponseBody extends ModbusWriteResponseBody {

  get start () {
    return this._start
  }

  get quantity () {
    return this._quantity
  }

  get count () {
    return this.quantity
  }

  get byteCount () {
    return 5
  }

  /** Create WriteMultipleRegisterResponseBody from Request
   * @param {WriteMultipleRegistersRequestBody} request
   * @param {Buffer} coil
   * @returns WriteMultipleRegisterResponseBody
   */
  public static fromRequest (requestBody: WriteMultipleRegistersRequestBody) {
    const start = requestBody.address
    const quantity = requestBody.quantity

    return new WriteMultipleRegistersResponseBody(start, quantity)
  }

  public static fromBuffer (buffer: Buffer) {
    const fc = buffer.readUInt8(0)
    const start = buffer.readUInt16BE(1)
    const quantity = buffer.readUInt16BE(3)

    if (fc !== FC.WRITE_MULTIPLE_HOLDING_REGISTERS) {
      return null
    }

    return new WriteMultipleRegistersResponseBody(start, quantity)
  }
  protected _start: number
  protected _quantity: number

  constructor (start: number, quantity: number) {
    super(FC.WRITE_MULTIPLE_HOLDING_REGISTERS)
    this._start = start
    this._quantity = quantity
  }

  public createPayload () {
    const payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt16BE(this._start, 1)
    payload.writeUInt16BE(this._quantity, 3)

    return payload
  }
}
