import { ModbusRequestBody } from './request'

/**
 *
 *
 * @export
 * @abstract
 * @class ModbusAbstractRequest
 */
export default abstract class ModbusAbstractRequest<ReqBody extends ModbusRequestBody = ModbusRequestBody> {

  /** The actual modbus function code and parameters */
  public abstract get body (): ReqBody;

  /**
   * Unit ID
   *
   * @readonly
   * @abstract
   * @type {number}
   * @alias slaveId
   * @alias address
   * @memberof ModbusAbstractRequest
   */
  public abstract get unitId (): number;

  /**
   * Slave Id
   *
   * @readonly
   * @abstract
   * @alias unitId
   * @alias address
   * @type {number}
   * @memberof ModbusAbstractRequest
   */
  public abstract get slaveId (): number;

  /**
   * RTU Address
   *
   * @readonly
   * @abstract
   * @alias unitId
   * @alias slaveId
   * @type {number}
   * @memberof ModbusAbstractRequest
   */
  public abstract get address (): number;

  /**
   * The calculated byte count of the byte representation
   *
   * @readonly
   * @abstract
   * @type {number}
   * @memberof ModbusAbstractRequest
   */
  public abstract get byteCount (): number;

  public static fromBuffer: ModbusAbstractRequestFromBuffer<any> = (buffer) => {
    throw new TypeError('Cannot call from buffer from base abstract class')
  }
  protected abstract _body: ReqBody

  /**
   * Creates a buffer object representing the modbus request
   *
   * @abstract
   * @returns {Buffer}
   * @memberof ModbusAbstractRequest
   */
  public abstract createPayload (): Buffer
}

export type ModbusAbstractRequestFromBuffer<ReqBody extends ModbusRequestBody = any> =
  (buffer: Buffer) => ReqBody | null

export function isModbusRequest (x: any): x is ModbusAbstractRequest {
  if (x.body !== undefined) {
    return true
  } else {
    return false
  }
}
