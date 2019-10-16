import Debug = require('debug'); const debug = Debug('rtu-response')
import CRC = require('crc')
import ModbusAbstractResponse from './abstract-response.js'
import { ModbusRequestBody } from './request/index.js'
import ModbusResponseBody from './response/response-body.js'
import ResponseFactory from './response/response-factory.js'
import ModbusRTURequest from './rtu-request.js'

export default class ModbusRTUResponse<ResBody extends ModbusResponseBody = ModbusResponseBody>
  extends ModbusAbstractResponse<ResBody> {

  get address () {
    return this._address
  }

  get crc () {
    return this._crc
  }

  get body () {
    return this._body
  }

  get byteCount () {
    return this._body.byteCount + 3
  }

  get slaveId () {
    return this._address
  }

  get unitId () {
    return this._address
  }

  /** Create Modbus/RTU Response from a Modbus/RTU Request including
   * the modbus function body.
   * @param {ModbusRTURequest} request
   * @param {ModbusResponseBody} body
   * @returns {ModbusRTUResponse}
   */
  public static fromRequest<ReqBody extends ModbusRequestBody, ResBody extends ModbusResponseBody> (
    rtuRequest: ModbusRTURequest<ReqBody>,
    modbusBody: ResBody
  ): ModbusRTUResponse<ResBody> {
    return new ModbusRTUResponse(
      rtuRequest.address,
      undefined,  // CRC is calculated when createPayload () is called
      modbusBody)
  }

  public static fromBuffer (buffer: Buffer) {
    if (buffer.length < 1) {
      return null
    }

    const address = buffer.readUInt8(0)

    debug('address', address, 'buffer', buffer)

    const body = ResponseFactory.fromBuffer(buffer.slice(1))

    if (!body) {
      return null
    }

    let crc
    try {
      crc = buffer.readUInt16LE(1 + body.byteCount)
    } catch (e) {
      debug('If NoSuchIndexException, it is probably serial and not all data has arrived')
      return null
    }

    return new ModbusRTUResponse(address, crc, body)
  }
  public _address: number
  public _crc: number | undefined
  protected _body: ResBody

  constructor (address: number, crc: number | undefined, body: ResBody) {
    super()
    this._address = address
    this._crc = crc
    this._body = body
  }

  public createPayload () {
    /* Payload is a buffer with:
     * Address/Unit ID = 1 Byte
     * Body = N Bytes
     * CRC = 2 Bytes
     */
    const payload = Buffer.alloc(this.byteCount)
    payload.writeUInt8(this._address, 0)
    const bodyPayload = this._body.createPayload()
    bodyPayload.copy(payload, 1)
    this._crc = CRC.crc16modbus(payload.slice(0, this.byteCount - 2 /* CRC bytes */))
    payload.writeUInt16LE(this._crc, this.byteCount - 2)
    return payload
  }
}
