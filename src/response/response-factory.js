let debug = require('debug')('response-factory')

let ExceptionResponseBody = require('./exception.js')
let ReadCoilsResponseBody = require('./read-coils.js')
let ReadDiscreteInputsBody = require('./read-discrete-inputs.js')
let ReadHoldingRegistersBody = require('./read-holding-registers.js')
let ReadInputRegistersBody = require('./read-input-registers.js')
let WriteSingleCoilBody = require('./write-single-coil.js')
let WriteSingleRegisterBody = require('./write-single-register.js')
let WriteMultipleCoilsBody = require('./write-multiple-coils.js')
let WriteMultipleRegistersBody = require('./write-multiple-registers.js')

/** Response Factory
 * @factory
 */
class ResponseFactory {
  static fromBuffer (buffer) {
    try {
      let fc = buffer.readUInt8(0)

      debug('fc', fc, 'payload', buffer)

      /* Exception Response */
      if (fc > 0x80) {
        return ExceptionResponseBody.fromBuffer(buffer)
      }

      /* Read Coils Response */
      if (fc === 0x01) {
        return ReadCoilsResponseBody.fromBuffer(buffer)
      }

      /* Read Discrete Inputs Response */
      if (fc === 0x02) {
        return ReadDiscreteInputsBody.fromBuffer(buffer)
      }

      /* Read Holding Registers Response */
      if (fc === 0x03) {
        return ReadHoldingRegistersBody.fromBuffer(buffer)
      }

      /* Read Input Registers Response */
      if (fc === 0x04) {
        return ReadInputRegistersBody.fromBuffer(buffer)
      }

      /* Write Single Coil Response */
      if (fc === 0x05) {
        return WriteSingleCoilBody.fromBuffer(buffer)
      }

      /* Write Single Register Response */
      if (fc === 0x06) {
        return WriteSingleRegisterBody.fromBuffer(buffer)
      }

      /* Write Multiple Coils Response */
      if (fc === 0x0F) {
        return WriteMultipleCoilsBody.fromBuffer(buffer)
      }

      /* Write Multiple Registers Response */
      if (fc === 0x10) {
        return WriteMultipleRegistersBody.fromBuffer(buffer)
      }

      return null
    } catch (e) {
      debug('when NoSuchIndex Exception, the buffer does not contain a complete message')
      debug(e)
      return null
    }
  }

}

module.exports = ResponseFactory
