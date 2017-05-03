let debug = require('debug')('read-coils-response')

class ReadCoilsResponseBody {

  static fromBuffer (buffer) {
    let byteCount = buffer.readUInt8(0)
    let coilStatus = buffer.slice(1, 1 + byteCount)
    let payload = buffer.slice(1, 1 + byteCount)

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

    return new ReadCoilsResponseBody(coils, byteCount + 2, payload)
  }

  constructor (coils, length, payload) {
    this._coils = coils
    this._length = length
    this._payload = payload
  }

  get fc () {
    return 0x01
  }

  get coils () {
    return this._coils
  }

  get payload () {
    return this._payload
  }

  get length () {
    return this._length
  }

}

module.exports = ReadCoilsResponseBody
