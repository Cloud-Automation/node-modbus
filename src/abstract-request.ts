import ModbusRequestBody from "./request/request-body";

/**
 *
 *
 * @export
 * @abstract
 * @class ModbusAbstractRequest
 */
export default abstract class ModbusAbstractRequest {
  protected abstract _body: ModbusRequestBody;

  /** The actual modbus function code and parameters */
  public abstract get body(): ModbusRequestBody;

  static fromBuffer: ModbusAbstractRequestFromBuffer = (buffer) => {
    throw new TypeError('Cannot call from buffer from base abstract class')
  }

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
  public abstract get unitId(): number;

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
  public abstract get slaveId(): number;

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
  public abstract get address(): number;


  /**
   * Creates a buffer object representing the modbus request
   *
   * @abstract
   * @returns {Buffer}
   * @memberof ModbusAbstractRequest
   */
  public abstract createPayload(): Buffer;

  /**
   * The calculated byte count of the byte representation
   *
   * @readonly
   * @abstract
   * @type {number}
   * @memberof ModbusAbstractRequest
   */
  public abstract get byteCount(): number;
}

export type ModbusAbstractRequestFromBuffer = (buffer: Buffer) => ModbusAbstractRequest | null;

export function isModbusRequest(x: any): x is ModbusAbstractRequest {
  if (x.body !== undefined) {
    return true;
  } else {
    return false;
  }
}