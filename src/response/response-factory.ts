const debug = require('debug')('response-factory')

import ExceptionResponseBody from './exception.js';
import ReadCoilsResponseBody from './read-coils.js';
import ReadDiscreteInputsBody from './read-discrete-inputs.js';
import ReadHoldingRegistersBody from './read-holding-registers.js';
import ReadInputRegistersBody from './read-input-registers.js';
import WriteSingleCoilBody from './write-single-coil.js';
import WriteSingleRegisterBody from './write-single-register.js';
import WriteMultipleCoilsBody from './write-multiple-coils.js';
import WriteMultipleRegistersBody from './write-multiple-registers.js';
import { FC } from '../codes/index.js';

/** Response Factory
 * @factory
 */
export default class ResponseFactory {
  static fromBuffer(buffer: Buffer) {
    try {
      const fc = buffer.readUInt8(0)

      debug('fc', fc, 'payload', buffer)

      /* Exception Response */
      if (fc > 0x80) {
        return ExceptionResponseBody.fromBuffer(buffer)
      }

      /* Read Coils Response */
      if (fc === FC.READ_COIL) {
        return ReadCoilsResponseBody.fromBuffer(buffer)
      }

      /* Read Discrete Inputs Response */
      if (fc === FC.READ_DISCRETE_INPUT) {
        return ReadDiscreteInputsBody.fromBuffer(buffer)
      }

      /* Read Holding Registers Response */
      if (fc === FC.READ_HOLDING_REGISTERS) {
        return ReadHoldingRegistersBody.fromBuffer(buffer)
      }

      /* Read Input Registers Response */
      if (fc === FC.READ_INPUT_REGISTERS) {
        return ReadInputRegistersBody.fromBuffer(buffer)
      }

      /* Write Single Coil Response */
      if (fc === FC.WRITE_SINGLE_COIL) {
        return WriteSingleCoilBody.fromBuffer(buffer)
      }

      /* Write Single Register Response */
      if (fc === FC.WRITE_SINGLE_HOLDING_REGISTER) {
        return WriteSingleRegisterBody.fromBuffer(buffer)
      }

      /* Write Multiple Coils Response */
      if (fc === FC.WRITE_MULTIPLE_COILS) {
        return WriteMultipleCoilsBody.fromBuffer(buffer)
      }

      /* Write Multiple Registers Response */
      if (fc === FC.WRITE_MULTIPLE_HOLDING_REGISTERS) {
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
