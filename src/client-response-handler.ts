import ModbusTCPResponse from './tcp-response';
import ModbusRTUResponse from './rtu-response';

/** Modbus Client Repsonse Handler
 * @abstract
 */
export default abstract class ModbusClientResponseHandler {
  protected _buffer: Buffer;
  protected abstract _messages: ModbusTCPResponse[] | ModbusRTUResponse[];

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
