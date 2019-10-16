import Debug = require('debug'); const debug = Debug('tcp-response')
import ModbusAbstractResponse from './abstract-response.js'
import { ModbusRequestBody } from './request'
import ModbusResponseBody from './response/response-body.js'
import ResponseFactory from './response/response-factory.js'
import ModbusTCPRequest from './tcp-request.js'

/** Modbus/TCP Response
 * @class
 */
export default class ModbusTCPResponse<ResBody extends ModbusResponseBody = ModbusResponseBody>
  extends ModbusAbstractResponse<ResBody> {

  /** Transaction ID */
  get id () {
    return this._id
  }

  /** Protocol version */
  get protocol () {
    return this._protocol
  }

  /** Body length */
  get bodyLength () {
    return this._bodyLength
  }

  /** Payload byte count */
  get byteCount () {
    return this._bodyLength + 6
  }

  get unitId () {
    return this._unitId
  }

  get slaveId () {
    return this._unitId
  }

  get address () {
    return this._unitId
  }

  /** Modbus response body */
  get body () {
    return this._body
  }

  /** Create Modbus/TCP Response from a Modbus/TCP Request including
   * the modbus function body.
   * @param {ModbusTCPRequest} request
   * @param {ModbusResponseBody} body
   * @returns {ModbusTCPResponse}
   */
  public static fromRequest<ReqBody extends ModbusRequestBody, ResBody extends ModbusResponseBody> (
    tcpRequest: ModbusTCPRequest<ReqBody>,
    modbusBody: ResBody
  ) {
    return new ModbusTCPResponse(
      tcpRequest.id,
      tcpRequest.protocol,
      modbusBody.byteCount + 1,
      tcpRequest.unitId,
      modbusBody)
  }

  /** Create Modbus/TCP Response from a buffer
   * @param {Buffer} buffer
   * @returns {ModbusTCPResponse} Returns null if not enough data located in the buffer.
   */
  public static fromBuffer (buffer: Buffer) {
    try {
      const id = buffer.readUInt16BE(0)
      const protocol = buffer.readUInt16BE(2)
      const length = buffer.readUInt16BE(4)
      const unitId = buffer.readUInt8(6)

      debug('tcp header complete, id', id, 'protocol', protocol, 'length', length, 'unitId', unitId)
      debug('buffer', buffer)

      const body = ResponseFactory.fromBuffer(buffer.slice(7, 7 + length - 1))

      if (!body) {
        debug('not enough data for a response body')
        return null
      }

      debug('buffer contains a valid response body')

      return new ModbusTCPResponse(id, protocol, length, unitId, body)
    } catch (e) {
      debug('not enough data available')
      return null
    }
  }
  protected _id: number
  protected _protocol: number
  protected _bodyLength: number
  protected _unitId: number
  protected _body: ResBody

  /** Create new Modbus/TCP Response Object.
   * @param {number} id Transaction ID
   * @param {number} protocol Protcol version (Usually 0)
   * @param {number} bodyLength Body length + 1
   * @param {number} unitId Unit ID
   * @param {ModbusResponseBody} body Modbus response body object
   */
  constructor (id: number, protocol: number, bodyLength: number, unitId: number, body: ResBody) {
    super()
    this._id = id
    this._protocol = protocol
    this._bodyLength = bodyLength
    this._unitId = unitId
    this._body = body
  }

  public createPayload () {
    /* Payload is a buffer with:
     * Transaction ID = 2 Bytes
     * Protocol ID = 2 Bytes
     * Length = 2 Bytes
     * Unit ID = 1 Byte
     * Function code = 1 Byte
     * Byte count = 1 Byte
     * Coil status = n Bytes
     */
    const payload = Buffer.alloc(this.byteCount)
    payload.writeUInt16BE(this._id, 0)
    payload.writeUInt16BE(this._protocol, 2)
    payload.writeUInt16BE(this._bodyLength, 4)
    payload.writeUInt8(this._unitId, 6)
    this._body.createPayload().copy(payload, 7)

    return payload
  }
}
