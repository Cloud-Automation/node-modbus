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
        if (this._resynchronize()) {
          continue
        }

        debug('not enough data available to parse')
        /* nothing could be skipped, so the bytes left are one frame that is still arriving;
         * anything beyond the largest possible ADU cannot be waiting for more data
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

  /** Move the buffer to the next plausible frame after a response failed to parse and report
   * whether anything was skipped.
   *
   * Unlike a raw serial stream, Modbus/TCP prefixes every frame with an MBAP header stating the
   * exact frame length, so a desynchronized buffer can normally be realigned in a single step
   * rather than by waiting for it to outgrow an ADU. A frame that has fully arrived and still
   * does not parse - an unimplemented function code, a corrupt payload - is skipped whole,
   * because its header told us exactly where the next one begins.
   *
   * Bytes that cannot be an MBAP header at all cost a single byte each instead: the real frame
   * may begin anywhere inside them, so skipping further could swallow it.
   */
  private _resynchronize () {
    if (this._buffer.length < LIMITS.MBAP_PREFIX_LENGTH) {
      /* the header itself is still arriving */
      return false
    }

    const protocol = this._buffer.readUInt16BE(2)
    const length = this._buffer.readUInt16BE(4)

    if (protocol !== LIMITS.MBAP_PROTOCOL_ID || length < 2 || length > LIMITS.PDU_MAX + 1) {
      debug('implausible mbap header, skipping one byte to resynchronize')
      this._buffer = this._buffer.slice(1)
      return true
    }

    const frameLength = LIMITS.MBAP_PREFIX_LENGTH + length

    if (this._buffer.length < frameLength) {
      /* the announced frame is still on its way */
      return false
    }

    debug('skipping a complete but unparsable frame of', frameLength, 'bytes')
    this._buffer = this._buffer.slice(frameLength)

    return true
  }
}
