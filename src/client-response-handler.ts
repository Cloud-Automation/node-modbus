import MBAbstractResponse from './abstract-response'
import { LIMITS } from './constants'

/** Modbus Client Repsonse Handler
 * @abstract
 */
export default abstract class ModbusClientResponseHandler<ResType extends MBAbstractResponse = MBAbstractResponse> {
  protected _buffer: Buffer
  protected abstract _messages: ResType[]
  protected readonly _maxBufferSize: number

  /** Create new Modbus Client Response Handler
   * @param {number} [maxBufferSize=LIMITS.TCP_ADU_MAX] The number of bytes the receive buffer may
   *   hold without a single complete response being parsable from it. Defaults to the largest
   *   Modbus/TCP ADU.
   */
  constructor (maxBufferSize: number = LIMITS.TCP_ADU_MAX) {
    this._buffer = Buffer.alloc(0)
    this._maxBufferSize = maxBufferSize
  }

  /** The number of bytes the receive buffer may hold without a single complete response
   * being parsable from it.
   */
  public get maxBufferSize () {
    return this._maxBufferSize
  }

  /** Process new incoming data and enqueue new modbus responses.
   * @param {Buffer} data New incoming data from the socket.
   */
  public abstract handleData (data: Buffer): void

  /** Extract latest Modbus Response.
   * @returns {ModbusResponse}
   */
  public shift () {
    return this._messages.shift()
  }

  /** Discard the receive buffer if it cannot hold the beginning of a valid frame anymore.
   *
   * The buffer only ever advances when a complete response parses, and every frame is read
   * from offset 0. A frame that never completes - a device answering with fewer bytes than
   * its header announces, a truncated frame, line noise - therefore stays in front of every
   * following response forever, and the client keeps timing out until the socket is
   * reconnected.
   *
   * Whatever is dropped may contain the beginning of an intact response, in which case the
   * remainder of that response desyncs the buffer again and is discarded the same way. The
   * resynchronization therefore is not immediate, but it always converges.
   *
   * Call this only once no further response can be parsed from the buffer.
   */
  protected _discardOversizedBuffer () {
    if (this._buffer.length <= this._maxBufferSize) {
      return
    }

    this._buffer = Buffer.alloc(0)
  }
}
