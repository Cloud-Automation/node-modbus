import Debug = require('debug'); const debug = Debug('rtu-request')
import CRC = require('crc')
import ModbusAbstractRequest from './abstract-request.js'
import ModbusRequestBody from './request/request-body.js'
import RequestFactory from './request/request-factory.js'

/**
 *
 *
 * @export
 * @class ModbusRTURequest
 * @extends {ModbusAbstractRequest}
 */
export default class ModbusRTURequest<ReqBody extends ModbusRequestBody = ModbusRequestBody>
  extends ModbusAbstractRequest<ReqBody> {

  get address () {
    return this._address
  }

  get slaveId () {
    return this.address
  }

  get unitId () {
    return this.address
  }

  get crc () {
    return this._crc
  }

  get name () {
    return this._body.name
  }

  get corrupted () {
    return (this._corrupted === true)
  }

  public get body () {
    return this._body
  }

  get byteCount () {
    return this.body.byteCount + 3
  }

  /** Convert a buffer into a new Modbus RTU Request. Returns null if the buffer
   * does not contain enough data.
   * @param {Buffer} buffer
   * @return  A new Modbus RTU Request or null.
   */
  public static fromBuffer (buffer: Buffer) {
    try {
      if (buffer.length < 1 /* address */ + 2 /* CRC */) {
        debug('not enough data in the buffer yet')
        return null
      }

      const address = buffer.readUInt8(0)

      debug(`rtu header complete, address, ${address}`)
      debug('buffer', buffer)

      // NOTE: This is potentially more than the body; the body length isn't know at this point...
      const body = RequestFactory.fromBuffer(buffer.slice(1))

      if (!body) {
        return null
      }

      const payloadLength = 1 /* address */ + body.byteCount
      const expectedCrc = CRC.crc16modbus(buffer.slice(0, payloadLength))
      const actualCrc = buffer.readUInt16LE(payloadLength)
      const corrupted = (expectedCrc !== actualCrc)

      return new ModbusRTURequest(address, body, corrupted)
    } catch (e) {
      debug('not enough data to create a rtu request', e)
      return null
    }
  }
  protected _address: number
  protected _body: ReqBody
  protected _corrupted: boolean
  protected _crc!: number
  /**
   * Creates an instance of ModbusRTURequest.
   * @param {number} address
   * @param {ReqBody} body
   * @param {boolean} [corrupted=false]
   * @memberof ModbusRTURequest
   */
  constructor (address: number, body: ReqBody, corrupted: boolean = false) {
    super()
    this._address = address
    this._body = body
    this._corrupted = corrupted
  }

  public createPayload () {
    const bodyPayload = this._body.createPayload()

    this._crc = CRC.crc16modbus(Buffer.concat([Buffer.from([this._address]), bodyPayload]))
    const crBu = Buffer.alloc(2)
    crBu.writeUInt16LE(this._crc, 0)
    const idBuf = Buffer.from([this._address])
    const payload = Buffer.concat([idBuf, bodyPayload, crBu])

    return payload
  }
}
