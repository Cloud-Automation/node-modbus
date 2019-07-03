import ModbusTCPResponse from './tcp-response';
import ModbusRTUResponse from './rtu-response';
import ModbusAbstractResponse from './abstract-response';

/** Modbus Client Repsonse Handler
 * @abstract
 */
export default abstract class ModbusClientResponseHandler<ResType extends ModbusAbstractResponse> {
  protected _buffer: Buffer;
  protected abstract _messages: ResType[];

  /** Create new Modbus Client Response Hanlder */
  constructor() {
    this._buffer = Buffer.alloc(0)
  }

  /** Process new incoming data and enqueue new modbus responses.
   * @param {Buffer} data New incoming data from the socket.
   */
  public abstract handleData(data: Buffer): void;

  /** Extract latest Modbus Response.
   * @returns {ModbusResponse}
   */
  shift() {
    return this._messages.shift()
  }
}
