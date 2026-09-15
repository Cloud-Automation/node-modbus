import Debug = require('debug'); const debug = Debug('rtu-response')
import * as CRC from 'crc'
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

  /** True when the frame's CRC does not match its payload, which means these bytes are not a
   * trustworthy response - either the buffer lost its frame alignment or the line corrupted
   * the message. Mirrors ModbusRTURequest#corrupted.
   */
  get corrupted () {
    return this._corrupted
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
    if (buffer.length < 1 /* address */ + 2 /* CRC */) {
      return null
    }

    const address = buffer.readUInt8(0)

    debug('address', address, 'buffer', buffer)

    const body = ResponseFactory.fromBuffer(buffer.slice(1))

    if (!body) {
      return null
    }

    const payloadLength = 1 /* address */ + body.byteCount

    let actualCrc
    try {
      actualCrc = buffer.readUInt16LE(payloadLength)
    } catch (e) {
      debug('If NoSuchIndexException, it is probably serial and not all data has arrived')
      return null
    }

    /* Modbus/RTU carries no framing in the payload, so the CRC is the only evidence that the
     * bytes really start a response here. Without it a buffer that lost its alignment parses
     * into a structurally valid but entirely fabricated response - a stray leading byte turns
     * a read holding registers answer into a read coils answer with invented values.
     */
    const expectedCrc = CRC.crc16modbus(buffer.slice(0, payloadLength))
    const corrupted = (expectedCrc !== actualCrc)

    if (corrupted) {
      debug('crc mismatch, expected', expectedCrc, 'got', actualCrc)
    }

    return new ModbusRTUResponse(address, actualCrc, body, corrupted)
  }
  public _address: number
  public _crc: number | undefined
  protected _body: ResBody
  protected _corrupted: boolean

  /** Create new Modbus/RTU Response Object.
   * @param {number} address Address/Unit ID
   * @param {number} [crc] CRC of the frame, undefined until createPayload () calculates it
   * @param {ModbusResponseBody} body Modbus response body object
   * @param {boolean} [corrupted=false] Whether the frame's CRC failed to verify
   */
  constructor (address: number, crc: number | undefined, body: ResBody, corrupted: boolean = false) {
    super()
    this._address = address
    this._crc = crc
    this._body = body
    this._corrupted = corrupted
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
