

import { FunctionCode } from "../codes";

import Debug from 'debug';
const debug = Debug('request-body')

export type ModbusRequestTypeName =
  | 'ReadCoils'
  | 'ReadDiscreteInput'
  | 'ReadHoldingRegisters'
  | 'ReadInputRegisters'
  | 'WriteMultipleCoils'
  | 'WriteMultipleRegisters'
  | 'WriteSingleCoil'
  | 'WriteSingleRegister'
  | 'ExceptionRequest'
/** Common Modbus Request Body
 *
 *
 * @abstract
 * @class ModbusRequestBody
 */
export default abstract class ModbusRequestBody {
  protected _fc: FunctionCode;

  /** Creates a new Common Modbus Request Body. Do not use this,
   * use the actual request body
   * @param {FunctionCode} fc Function Code
   */
  constructor(fc: FunctionCode) {
    if (new.target === ModbusRequestBody) {
      throw new TypeError('Cannot construct ModbusRequestBody directly.')
    }

    this._fc = fc
  }

  /** Function Code */
  get fc() {
    return this._fc
  }

  /** Create byte representation.
   * @returns {Buffer}
   */
  abstract createPayload(): Buffer

  /** Returns the byte count of the `request` for the byte representation.
   * @returns {Number}
   */
  abstract get byteCount(): number

  /**
   * Name of the request body
   *
   * @memberof ModbusRequestBody
   */
  abstract get name(): ModbusRequestTypeName;

  /**
   * Returns the count of the quantity
   * of registers, coils, etc.
   *
   * @readonly
   * @abstract
   * @type {number}
   * @memberof ModbusRequestBody
   */
  abstract get count(): number;

  get isException(): boolean {
    return false;
  }

  public get isModbusRequestBody() {
    return true;
  }
}

export function isModbusRequestBody(x: any): x is ModbusRequestBody {
  if (x.isModbusRequestBody) {
    return true;
  } else {
    return false;
  }
}