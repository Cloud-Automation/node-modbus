import Debug from 'debug'; const debug = Debug('rtu-response-handler')
import ModbusClientResponseHandler from './client-response-handler.js'
import { isFunctionCode } from './codes'
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
        if (this._resynchronize()) {
          continue
        }

        debug('not enough data available to parse')
        /* the remaining bytes are at most one incomplete frame by now, so anything beyond
         * the largest possible ADU cannot be waiting for more data to arrive
         */
        this._discardOversizedBuffer()
        return
      }

      if (response.corrupted) {
        /* The CRC covers the whole frame, so a mismatch proves offset 0 is not where this
         * response starts. Drop a single byte rather than the frame the parser believed it
         * saw: its byte count was derived from bytes we just proved untrustworthy, so
         * skipping it could swallow the real frame that begins in the middle of it.
         */
        debug('crc mismatch, skipping one byte to resynchronize')
        this._buffer = this._buffer.slice(1)
        continue
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

  /** Drop the leading byte when it provably cannot begin a response, and report whether it did.
   *
   * A frame that failed to parse is usually just still arriving, so the buffer has to be left
   * alone. The one thing that can be decided from an incomplete frame is its function code: the
   * parser accepts a body only for a known function code, or for an exception whose underlying
   * code is known, so anything else can never parse no matter how many bytes follow it. Waiting
   * for the buffer to outgrow an ADU before dropping it would stall every request in the
   * meantime, and each stalled request costs a full timeout.
   *
   * Only ever one byte: the real frame may start anywhere inside what is being skipped.
   */
  private _resynchronize () {
    if (this._buffer.length < 2) {
      /* the function code has not arrived yet */
      return false
    }

    const fc = this._buffer.readUInt8(1)
    const isException = fc > LIMITS.ERROR_CODE_THRESHOLD &&
      isFunctionCode(fc - LIMITS.ERROR_CODE_THRESHOLD)

    if (isFunctionCode(fc) || isException) {
      return false
    }

    debug('function code', fc, 'cannot start a response, skipping one byte to resynchronize')
    this._buffer = this._buffer.slice(1)

    return true
  }
}
