
/** Modbus Client Repsonse Handler
 * @abstract
 */
class ModbusClientResponseHandler {
	public _buffer: any;
	public _messages: any;

  /** Create new Modbus Client Response Hanlder */
  constructor () {
    if (new.target === ModbusClientResponseHandler) {
      throw new TypeError('Cannot instantiate ModbusClientResponseHandler directly')
    }
    this._buffer = Buffer.alloc(0)
    this._messages = []
  }

  /** Process new incoming data and enqueue new modbus responses.
   * @param {Buffer} data New incoming data from the socket.
   */
  handleData (data) {
    throw new Error('Not implemented yet.')
  }

  /** Extract latest Modbus Response.
   * @returns {ModbusResponse}
   */
  shift () {
    return this._messages.shift()
  }
}

module.exports = ModbusClientResponseHandler
