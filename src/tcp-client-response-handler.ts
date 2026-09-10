import Debug = require('debug'); const debug = Debug('tcp-response-handler')
import ModbusClientResponseHandler from './client-response-handler.js'
import { LIMITS } from './constants'
import ModbusTCPResponse from './tcp-response.js'

/** Modbus/TCP Client Response Handler.
 * @extends ModbusClientResponseHandler
 * @class
 */
export default class ModbusTCPClientResponseHandler extends ModbusClientResponseHandler<ModbusTCPResponse> {
  protected _messages: ModbusTCPResponse[]

  /** Create new Modbus/TCP Client Response Handler
   * @param {number} [maxBufferSize=LIMITS.TCP_ADU_MAX] The number of bytes the receive buffer may
   *   hold without a single complete response being parsable from it.
   */
  constructor (maxBufferSize: number = LIMITS.TCP_ADU_MAX) {
    super(maxBufferSize)
    this._messages = []
  }

  public handleData (data: Buffer) {
    debug('receiving new data', data)
    this._buffer = Buffer.concat([this._buffer, data])

    debug('buffer', this._buffer)

    do {
      const response = ModbusTCPResponse.fromBuffer(this._buffer)

      if (!response) {
        debug('not enough data available to parse')
        /* the remaining bytes are at most one incomplete frame by now, so anything beyond
         * the largest possible ADU cannot be waiting for more data to arrive
         */
        this._discardOversizedBuffer()
        return
      }

      debug(
        'response id', response.id,
        'protocol', response.protocol,
        'length', response.bodyLength,
        'unit', response.unitId
      )

      debug('reset buffer from', this._buffer.length, 'to', (this._buffer.length - response.byteCount))

      this._messages.push(response)

      /* reduce buffer */
      this._buffer = this._buffer.slice(response.byteCount)
    } while (1)
  }
}
