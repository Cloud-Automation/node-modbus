let Messages = {
  0x01: 'ILLEGAL FUNCTION',
  0x02: 'ILLEGAL DATA ADDRESS',
  0x03: 'ILLEGAL DATA VALUE',
  0x04: 'SLAVE DEVICE FAILURE',
  0x05: 'ACKNOWLEDGE',
  0x06: 'SLAVE DEVICE BUSY',
  0x08: 'MEMORY PARITY ERROR',
  0x0A: 'GATEWAY PATH UNAVAILABLE',
  0x0B: 'GATEWAY TARGET DEVICE FAILED TO RESPOND'
}

class ExceptionResponseBody {

  static fromBuffer (fc, payload) {
    let code = payload.readUInt8(0)
    return new ExceptionResponseBody(fc, code)
  }

  constructor (fc, code) {
    this._fc = fc
    this._code = code
  }

  get fc () {
    return this._fc
  }

  get code () {
    return this._code
  }

  get message () {
    return Messages[this._code]
  }

  get length () {
    return 2
  }

}

module.exports = ExceptionResponseBody
