'use strict'

let debug = require('debug')('request-body')

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
    /* TODO:detect non modbus requests and return a InvalidProtocolRequest. Requests
     * of this kind should lead to disconnecting the client. This way we can make sure that
     * unintendet messages do not harm the server */
    try {
      let fc = buffer.readUInt8(0)

      if (fc === 0x01) {
        let ReadCoilsRequest = require('./read-coils.js')
        return ReadCoilsRequest.fromBuffer(buffer)
      }
      if (fc === 0x02) {
        let ReadDiscreteInputsRequest = require('./read-discrete-inputs.js')
        return ReadDiscreteInputsRequest.fromBuffer(buffer)
      }
      if (fc === 0x03) {
        let ReadHoldingRegistersRequest = require('./read-holding-registers.js')
        return ReadHoldingRegistersRequest.fromBuffer(buffer)
      }
      if (fc === 0x04) {
        let ReadInputRegistersRequest = require('./read-input-registers.js')
        return ReadInputRegistersRequest.fromBuffer(buffer)
      }
      if (fc === 0x05) {
        let WriteSingleCoilRequest = require('./write-single-coil.js')
        return WriteSingleCoilRequest.fromBuffer(buffer)
      }
      if (fc === 0x06) {
        let WriteSingleRegisterRequest = require('./write-single-register.js')
        return WriteSingleRegisterRequest.fromBuffer(buffer)
      }

      if (fc <= 0x2B) {
        debug('Illegal Function (fc %d)', fc)
        let ExceptionRequest = require('./exception.js')
        return new ExceptionRequest(fc, 0x01)
      }
      if (fc === 0x0f) {
        let WriteMultipleCoilsResponse = require('./write-multiple-coils.js')
        return WriteMultipleCoilsResponse.fromBuffer(buffer)
      }

    } catch (e) {
      debug('Exception while reading function code', e)
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
