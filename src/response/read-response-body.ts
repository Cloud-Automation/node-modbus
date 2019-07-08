import { FunctionCode } from "../codes";
import ModbusBaseResponseBody from "./response-body";
import { BooleanArray } from "../constants";

/** Modbus Response Body
 * @abstract
 */
export default abstract class ModbusReadResponseBody extends ModbusBaseResponseBody {
  protected abstract _valuesAsArray?: number[] | BooleanArray | Uint16Array;
  protected abstract _valuesAsBuffer?: Buffer;

  /** Create new ModbusResponseBody
   * @param {FunctionCode} fc Function Code
   * @throws {InvalidFunctionCode}
   */
  constructor(fc: FunctionCode) {
    super(fc);
  }

  /** Function Code */
  get fc() {
    return this._fc
  }

  /** Number of bytes for the payload.  */
  abstract get byteCount(): number;

  /** Create payload to be send over a socket.
   * @returns {Buffer}
   */
  abstract createPayload(): Buffer;

  // /**
  //  * Start Address / Coil
  //  *
  //  * @abstract
  //  * @type {number}
  //  * @memberof ModbusResponseBody
  //  */
  // public abstract readonly start: number;

  // /**
  //  * Coil / Address Quantity
  //  *
  //  * @abstract
  //  * @type {number}
  //  * @memberof ModbusResponseBody
  //  */
  // public abstract readonly count: number;

  public abstract get valuesAsArray(): number[] | BooleanArray | Uint16Array
  public abstract get valuesAsBuffer(): Buffer

}