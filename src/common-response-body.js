let debug = require('debug')('common-response-body')

let ExceptionResponseBody = require('./response/exception.js')
let ReadCoilsResponseBody = require('./response/read-coils.js')
let ReadDiscreteInputsBody = require('./response/read-discrete-inputs.js')
let ReadHoldingRegistersBody = require('./response/read-holding-registers.js')
let ReadInputRegistersBody = require('./response/read-input-registers.js')
let WriteSingleCoilBody = require('./response/write-single-coil.js')
let WriteSingleRegisterBody = require('./response/write-single-register.js')
let WriteMultipleCoilsBody = require('./response/write-multiple-coils.js')
let WriteMultipleRegistersBody = require('./response/write-multiple-registers.js')

class CommonResponseBody {

  static fromBuffer (buffer) {
    try {
      let fc = buffer.readUInt8(0)
      let payload = buffer.slice(1)

      debug('fc', fc, 'payload', payload)

      /* Exception Response */
      if (fc > 0x80) {
        return ExceptionResponseBody.fromBuffer(fc, payload)
      }

      /* Read Coils Response */
      if (fc === 0x01) {
        return ReadCoilsResponseBody.fromBuffer(payload)
      }

      /* Read Discrete Inputs Response */
      if (fc === 0x02) {
        return ReadDiscreteInputsBody.fromBuffer(payload)
      }

      /* Read Holding Registers Response */
      if (fc === 0x03) {
        return ReadHoldingRegistersBody.fromBuffer(payload)
      }

      /* Read Input Registers Response */
      if (fc === 0x04) {
        return ReadInputRegistersBody.fromBuffer(payload)
      }

      /* Write Single Coil Response */
      if (fc === 0x05) {
        return WriteSingleCoilBody.fromBuffer(payload)
      }

      /* Write Single Register Response */
      if (fc === 0x06) {
        return WriteSingleRegisterBody.fromBuffer(payload)
      }

      /* Write Multiple Coils Response */
      if (fc === 0x0F) {
        return WriteMultipleCoilsBody.fromBuffer(payload)
      }

      /* Write Multiple Registers Response */
      if (fc === 0x10) {
        return WriteMultipleRegistersBody.fromBuffer(payload)
      }

      return new CommonResponseBody(fc, payload)
    } catch (e) {
      debug('when NoSuchIndex Exception, the buffer does not contain a complete message')
      debug(e)
      return null
    }
  }

  constructor (fc, payload) {
    this._fc = fc
    this._payload = payload
  }

  get fc () {
    return this._fc
  }

  get byteCount () {
    return this._byteCount
  }

  get payload () {
    return this._payload
  }

}

module.exports = CommonResponseBody
