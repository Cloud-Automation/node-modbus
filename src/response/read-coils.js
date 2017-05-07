let debug = require('debug')('read-coils-response')
let ModbusResponseBody = require('./response-body.js')

/** Read Coils Response Body
 * @extends ModbusResponseBody
 * @class
 */
class ReadCoilsResponseBody extends ModbusResponseBody {

  /** Create ReadCoilsResponseBody from buffer.
   * @param {Buffer} buffer
   * @returns {ReadCoilsResponseBody} Returns Null of not enough data located in the buffer.
   */
  static fromBuffer (buffer) {
    let byteCount = buffer.readUInt8(0)
    let coilStatus = buffer.slice(1, 1 + byteCount)

    debug('read coils byteCount', byteCount, 'coilStatus', coilStatus)

    /* calculate coils */
    let coils = []

    let cntr = 0
    for (let i = 0; i < byteCount; i += 1) {
      let h = 1
      debug('handling byte', i)
      let cur = coilStatus.readUInt8(i)
      for (let j = 0; j < 8; j += 1) {
        debug('bit', j)
        coils[cntr] = (cur & h) > 0
        h = h << 1
        cntr += 1
      }
    }

    return new ReadCoilsResponseBody(coils, byteCount + 2)
  }

  /** Create new ReadCoilsResponseBody
   * @param [Array] coils Array of Boolean.
   * @param [Number] length
   */
  constructor (coils, length) {
    super(0x01)
    this._coils = coils
    this._length = length
  }

  /** Coils */
  get coils () {
    return this._coils
  }

  /** Length */
  get length () {
    return this._length
  }

  get byteCount () {
    return Math.ceil(this._coils.length / 8) + 1
  }

}

module.exports = ReadCoilsResponseBody
