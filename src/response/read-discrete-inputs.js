let debug = require('debug')('read-discrete-inputs')
let ModbusResponseBody = require('./response-body.js')

/** Read Discrete Inputs Response Body (Function Code 0x02)
 * @extends ModbusResponseBody
 * @class
 */
class ReadDiscreteInputsResponseBody extends ModbusResponseBody {

  /** Create ReadDiscreteInputsResponseBody from Buffer
   * @param {Buffer} buffer
   * @returns ReadDiscreteInputsResponseBody
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

    return new ReadDiscreteInputsResponseBody(coils, byteCount + 1)
  }

  /** Creates a ReadDiscreteInputsResponseBody
   * @param {Array} coils Array with Boolean values
   * @param {Number} length Quantity of Coils
   */
  constructor (coils, length) {
    super(0x02)
    this._coils = coils
    this._length = length
  }

  /** Coils */
  get coils () {
    return this._coils
  }

  /** Quantity of Coils */
  get length () {
    return this._length
  }

  get byteCount () {
    return Math.ceil(this._coils.length / 8) + 2
  }

  createPayload () {
    let val = 0
    let thisByteBitCount = 0
    let byteIdx = 2
    let payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt8(this.byteCount, 1)

    for (var totalBitCount = 0; totalBitCount < this._coils.length; totalBitCount += 1) {
      var buf = this._coils[totalBitCount]
      var mask = 1 << (totalBitCount % 8)

      if (buf & mask) {
        val += 1 << (thisByteBitCount % 8)
      }

      thisByteBitCount += 1

      if (thisByteBitCount % 8 === 0 || totalBitCount === (this._coils.length) - 1) {
        payload.writeUInt8(val, byteIdx)
        val = 0; byteIdx = byteIdx + 1
      }
    }

    return payload
  }

}

module.exports = ReadDiscreteInputsResponseBody
