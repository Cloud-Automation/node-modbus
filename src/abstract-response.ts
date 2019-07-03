import ModbusResponseBody from "./response/response-body";
import ModbusAbstractRequest from "./abstract-request";

/**
 *
 *
 * @export
 * @abstract
 * @class ModbusAbstractResponse
 */
export default abstract class ModbusAbstractResponse {
  protected abstract _body: ModbusResponseBody

  /**
   * Creates Modbus TCP or RTU Response from a Modbus TCP or RTU Request including
   * the modbus function body.
   *
   * @static
   * @param {ModbusAbstractResponse} request
   * @param {ModbusResponseBody} body
   * @returns {ModbusAbstractResponse}
   * @memberof ModbusAbstractResponse
   */
  public static fromRequest(request: ModbusAbstractRequest, body: ModbusResponseBody): ModbusAbstractResponse {
    throw new Error('Cannot call fromRequest directly from abstract class')
  }

  /**
   * Unit ID
   *
   * @readonly
   * @abstract
   * @type {number}
   * @alias slaveId
   * @alias address
   * @memberof ModbusAbstractResponse
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
   * @memberof ModbusAbstractResponse
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
   * @memberof ModbusAbstractResponse
   */
  public abstract get address(): number;

  /** Modbus response body */
  public get body() {
    return this._body
  }

  public abstract createPayload(): Buffer;

}

export type ModbusAbstractResponseFromRequest = (request: ModbusAbstractRequest, body: ModbusResponseBody) => ModbusAbstractResponse;