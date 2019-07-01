const debug = require('debug')('tcp-request')
const CommonRequestBody = require('./request/request-body.js')

/** Class representing a Modbus TCP Request */
class ModbusTCPRequest {
	public _id: any;
	public _protocol: any;
	public _length: any;
	public _unitId: any;
	public _body: any;

  /** Convert a buffer into a new Modbus TCP Request. Returns null if the buffer
   * does not contain enough data.
   * @param {Buffer} buffer
   * @return {ModbusTCPRequest} A new Modbus TCP Request or Null.
   */
  static fromBuffer (buffer) {
    try {
      if (buffer.length < 7) {
        debug('no enough data in the buffer yet')
        return null
      }

      const id = buffer.readUInt16BE(0)
      const protocol = buffer.readUInt16BE(2)
      const length = buffer.readUInt16BE(4)
      const unitId = buffer.readUInt8(6)

      debug('tcp header complete, id', id, 'protocol', protocol, 'length', length, 'unitId', unitId)
      debug('buffer', buffer)

      const body = CommonRequestBody.fromBuffer(buffer.slice(7, 6 + length))

      if (!body) {
        return null
      }

      return new ModbusTCPRequest(id, protocol, length, unitId, body)
    } catch (e) {
      debug('not enough data to create a tcp request', e)
      return null
    }
  }

  /** Creates a new Modbus TCP Request
   * @param {Number} Transaction ID
   * @param {Number} Protocol Type
   * @param {Number} Byte count of the following data (inc. unitId)
   * @param {Number} Unit ID
   * @param {CommonRequestBody} Actual modbus request containing function code and parameters.
   */
  constructor (id, protocol, length, unitId, body) {
    this._id = id
    this._protocol = protocol
    this._length = length
    this._unitId = unitId
    this._body = body
  }

  /** The Transaction ID */
  get id () {
    return this._id
  }

  /** The protocol version */
  get protocol () {
    return this._protocol
  }

  /** The body length in bytes including the unit ID */
  get length () {
    return this._length
  }

  /** The unit ID */
  get unitId () {
    return this._unitId
  }

  /** The actual modbus function code and parameters */
  get body () {
    return this._body
  }

  /** get function name **/
  get name () {
    return this._body.name
  }

  /** For interface compatibility with ModbusRTURequest where data
   * integrity checking happens as part of the Modbus protocol **/
  get corrupted () {
    return false
  }

  /** Creates a buffer object representing the modbus tcp request.
   * @returns {Buffer} */
  createPayload () {
    const body = this._body.createPayload()
    const payload = Buffer.alloc(7 + this._body.byteCount)

    payload.writeUInt16BE(this._id, 0) // transaction id
    payload.writeUInt16BE(0x0000, 2) // protocol version
    payload.writeUInt16BE(this._body.byteCount + 1, 4) // length
    payload.writeUInt8(this._unitId, 6) // unit id

    body.copy(payload, 7)

    return payload
  }

  /** The calculated byte count of the byte representation */
  get byteCount () {
    return this._length + 6
  }
}

module.exports = ModbusTCPRequest
