const debug = require('debug')('rtu-request')
const CRC = require('crc')
const CommonRequestBody = require('./request/request-body.js')

class ModbusRTURequest {
  /** Convert a buffer into a new Modbus RTU Request. Returns null if the buffer
   * does not contain enough data.
   * @param {Buffer} buffer
   * @return {ModbusRTURequest} A new Modbus RTU Request or null.
   */
  static fromBuffer (buffer) {
    try {
      if (buffer.length < 1 /* address */ + 2 /* CRC */) {
        debug('not enough data in the buffer yet')
        return null
      }

      const address = buffer.readUInt8(0)

      debug(`rtu header complete, address, ${address}`)
      debug('buffer', buffer)

      // NOTE: This is potentially more than the body; the body length isn't know at this point...
      const body = CommonRequestBody.fromBuffer(buffer.slice(1))

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
  constructor (address, body, corrupted) {
    this._address = address
    this._body = body
    this._corrupted = corrupted
  }

  get address () {
    return this._address
  }

  get crc () {
    return this._crc
  }

  get body () {
    return this._body
  }

  get name () {
    return this._body.name
  }

  get corrupted () {
    return (this._corrupted === true)
  }

  createPayload () {
    const bodyPayload = this._body.createPayload()

    this._crc = CRC.crc16modbus(Buffer.concat([Buffer.from([this._address]), bodyPayload]))
    const crBu = Buffer.alloc(2)
    crBu.writeUInt16LE(this._crc)
    const idBuf = Buffer.from([this._address])
    const payload = Buffer.concat([idBuf, bodyPayload, crBu])

    return payload
  }

  get byteCount () {
    return this.body.byteCount + 3
  }
}

module.exports = ModbusRTURequest
