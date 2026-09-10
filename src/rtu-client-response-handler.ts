import Debug = require('debug'); const debug = Debug('rtu-response-handler')
import ModbusClientResponseHandler from './client-response-handler.js'
import { LIMITS } from './constants'
import ModbusRTUResponse from './rtu-response.js'

/** Modbus/RTU Client Response Handler
 * @extends ModbusClientResponseHandler
 * @class
 */
export default class ModbusRTUClientResponseHandler extends ModbusClientResponseHandler<ModbusRTUResponse> {
  protected _messages: ModbusRTUResponse[]

  /** Create new Modbus/RTU Client Response Handler
   * @param {number} [maxBufferSize=LIMITS.RTU_ADU_MAX] The number of bytes the receive buffer may
   *   hold without a single complete response being parsable from it.
   */
  constructor (maxBufferSize: number = LIMITS.RTU_ADU_MAX) {
    super(maxBufferSize)
    this._messages = []
  }

  public handleData (data: Buffer) {
    debug('receiving new data')
    this._buffer = Buffer.concat([this._buffer, data])

    debug('buffer', this._buffer)

    do {
      const response = ModbusRTUResponse.fromBuffer(this._buffer)

      if (!response) {
        debug('not enough data available to parse')
        /* the remaining bytes are at most one incomplete frame by now, so anything beyond
         * the largest possible ADU cannot be waiting for more data to arrive
         */
        this._discardOversizedBuffer()
        return
      }

      debug('crc', response.crc)

      debug('reset buffer from', this._buffer.length, 'to', (this._buffer.length - response.byteCount))

      /* reduce buffer */
      this._buffer = this._buffer.slice(response.byteCount)

      this._messages.push(response)
    } while (1)
  }

  public shift () {
    return this._messages.shift()
  }
}
