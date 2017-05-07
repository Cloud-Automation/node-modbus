let debug = require('debug')('tcp-response')
let CommonResponseBody = require('./common-response-body.js')

/** Modbus/TCP Response
 * @class
 */
class ModbusTCPResponse {

  /** Create Modbus/TCP Response from a buffer
   * @param {Buffer} buffer
   * @returns {ModbusTCPResponse} Returns null if not enough data located in the buffer.
   */
  static fromBuffer (buffer) {
    try {
      let id = buffer.readUInt16BE(0)
      let protocol = buffer.readUInt16BE(2)
      let length = buffer.readUInt16BE(4)
      let unitId = buffer.readUInt8(6)

      debug('tcp header complete, id', id, 'protocol', protocol, 'length', length, 'unitId', unitId)
      debug('buffer', buffer)

      let body = CommonResponseBody.fromBuffer(buffer.slice(7, 7 + length - 1))

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

  /** Create new Modbus/TCP Response Object.
   * @param {Number} id Transaction ID
   * @param {Number} protocol Protcol version (Usually 0)
   * @param {Number} bodyLength Body length + 1
   * @param {Number} unitId Unit ID
   * @param {ModbusResponseBody} body Modbus response body object
   */
  constructor (id, protocol, bodyLength, unitId, body) {
    this._id = id
    this._protocol = protocol
    this._bodyLength = bodyLength
    this._unitId = unitId
    this._body = body
  }

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

  /** Unit ID */
  get unitId () {
    return this._unitId
  }

  /** Modbus response body */
  get body () {
    return this._body
  }

}

module.exports = ModbusTCPResponse
