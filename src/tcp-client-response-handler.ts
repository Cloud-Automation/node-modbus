const debug = require('debug')('tcp-response-handler')
import ModbusTCPResponse from './tcp-response.js';
import ModbusClientResponseHandler from './client-response-handler.js';

/** Modbus/TCP Client Response Handler.
 * @extends ModbusClientResponseHandler
 * @class
 */
export default class ModbusTCPClientResponseHandler extends ModbusClientResponseHandler {
  protected _messages: ModbusTCPResponse[];

  /** Create new Modbus/TCP Client Response Handler */
  constructor() {
    super()
    this._buffer = Buffer.alloc(0)
    this._messages = []
  }

  handleData(data: Buffer) {
    debug('receiving new data', data)
    this._buffer = Buffer.concat([this._buffer, data])

    debug('buffer', this._buffer)

    do {
      const response = ModbusTCPResponse.fromBuffer(this._buffer)

      if (!response) {
        debug('not enough data available to parse')
        return
      }

      debug('response id', response.id, 'protocol', response.protocol, 'length', response.bodyLength, 'unit', response.unitId)

      debug('reset buffer from', this._buffer.length, 'to', (this._buffer.length - response.byteCount))

      this._messages.push(response)

      /* reduce buffer */
      this._buffer = this._buffer.slice(response.byteCount)
    } while (1)
  }
}
