const debug = require('debug')('rtu-response-handler')
const ModbusRTUResponse = require('./rtu-response.js')
const ModbusClientResponseHandler = require('./client-response-handler.js')

/** Modbus/RTU Client Response Handler
 * @extends ModbusClientResponseHandler
 * @class
 */
class ModbusRTUClientResponseHandler extends ModbusClientResponseHandler {
  handleData (data) {
    debug('receiving new data')
    this._buffer = Buffer.concat([this._buffer, data])

    debug('buffer', this._buffer)

    do {
      const response = ModbusRTUResponse.fromBuffer(this._buffer)

      if (!response) {
        debug('not enough data available to parse')
        return
      }

      debug('crc', response.crc)

      debug('reset buffer from', this._buffer.length, 'to', (this._buffer.length - response.byteCount))

      /* reduce buffer */
      this._buffer = this._buffer.slice(response.byteCount)

      this._messages.push(response)
    } while (1)
  }

  shift () {
    return this._messages.shift()
  }
}

module.exports = ModbusRTUClientResponseHandler
