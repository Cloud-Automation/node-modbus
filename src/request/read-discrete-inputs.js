  const ModbusRequestBody = require('./request-body.js')

  /** Read Discrete Inputs Request Body
   * @extends ModbusRequestBody
   */
  class ReadDiscreteInputsRequestBody extends ModbusRequestBody {
    static fromBuffer (buffer) {
      try {
        const fc = buffer.readUInt8(0)

        if (fc !== 0x02) {
          return null
        }

        const start = buffer.readUInt16BE(1)
        const quantity = buffer.readUInt16BE(3)

        return new ReadDiscreteInputsRequestBody(start, quantity)
      } catch (e) {
        return null
      }
    }

    /** Create a new Read Discrete Inputs Request Body.
     * @param {Number} start Start Address.
     * @param {Number} count Quantity of coils to be read.
     * @throws {InvalidStartAddressException} When Start address is larger than 0xFFFF.
     * @throws {InvalidQuantityException} When count is larger than 0x7D0.
     */
    constructor (start, count) {
      super(0x02)

      if (start > 0xFFFF) {
        throw new Error('InvalidStartAddress')
      }

      if (count > 0x7D0) {
        throw new Error('InvalidQuantity')
      }

      this._start = start
      this._count = count
    }

    /** Start Address. */
    get start () {
      return this._start
    }

    /** Coil Quantity. */
    get count () {
      return this._count
    }

    get name () {
      return 'ReadDiscreteInput'
    }

    createPayload () {
      const payload = Buffer.alloc(5)

      payload.writeUInt8(this._fc, 0) // function code
      payload.writeUInt16BE(this._start, 1) // start address
      payload.writeUInt16BE(this._count, 3) // quantitiy of coils

      return payload
    }

    get byteCount () {
      return 5
    }
  }

  module.exports = ReadDiscreteInputsRequestBody
