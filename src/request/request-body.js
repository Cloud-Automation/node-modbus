'use strict'

/** Common Modbus Request Body
 * @abstract
 */
class ModbusRequestBody {
  /** Create a Modbus Request Body from a buffer object. Depending on the function code
   * in the buffer the request body could by any function codes request body.
   * @param {Buffer} buffer The buffer to be parsed.
   * @returns {ModbusRequestBody} The actual request body or null if there is not enough data in the buffer.
   */
  static fromBuffer (buffer) {
    try {
      let fc = buffer.readUInt8(0)

      if (fc === 0x01) {
        let ReadCoilsResponse = require('./read-coils.js')
        return ReadCoilsResponse.fromBuffer(buffer)
      }
      if (fc === 0x02) {
        let ReadDiscreteInputsResponse = require('./read-discrete-inputs.js')
        return ReadDiscreteInputsResponse.fromBuffer(buffer)
      }
      if (fc === 0x03) {
        let ReadHoldingRegistersResponse = require('./read-holding-registers.js')
        return ReadHoldingRegistersResponse.fromBuffer(buffer)
      }
      if (fc === 0x04) {
        let ReadInputRegistersResponse = require('./read-input-registers.js')
        return ReadInputRegistersResponse.fromBuffer(buffer)
      }
      if (fc === 0x05) {
        let WriteSingleCoilResponse = require('./write-single-coil.js')
        return WriteSingleCoilResponse.fromBuffer(buffer)
      }
      if (fc === 0x06) {
        let WriteSingleRegisterResponse = require('./write-single-register.js')
        return WriteSingleRegisterResponse.fromBuffer(buffer)
      }
    } catch (e) {
      return null
    }
  }

  /** Creates a new Common Modbus Request Body. Do not use this, use the actual request body
   * @param {Number} fc Function Code
   */
  constructor (fc) {
    if (new.target === ModbusRequestBody) {
      throw new TypeError('Cannot construct ModbusRequestBody directly.')
    }

    this._fc = fc
  }

  /** Function Code */
  get fc () {
    return this._fc
  }

  /** Create byte representation.
   * @returns {Buffer}
   */
  createPayload () {
    throw new Error('Not implemented yet.')
  }

  /** Returns the byte count of this request for the byte representation.
   * @returns {Number}
   */
  get byteCount () {
    throw new Error('No implemented yet.')
  }
}

module.exports = ModbusRequestBody
