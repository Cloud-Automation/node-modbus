
/** Modbus Response Body
 * @abstract
 */
class ModbusResponseBody {

  /** Create new ModbusResponseBody
   * @param {Number} fc Function Code
   */
  constructor (fc) {
    if (new.target === ModbusResponseBody) {
      throw new TypeError('Cannot instantiate ModbusResponseBody directly.')
    }
    this._fc = fc
  }

  /** Function Code */
  get fc () {
    return this._fc
  }

  /** Number of bytes for the payload.  */
  get byteCount () {
    throw new Error('Not implemented yet.')
  }

  /** Create payload to be send over a socket.
   * @returns {Buffer}
   */
  createPayload () {
    throw new Error('Not implemented yet.')
  }

}

module.exports = ModbusResponseBody
