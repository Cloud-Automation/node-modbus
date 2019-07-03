import ModbusRTURequest from "./rtu-request";
import ModbusAbstractRequest, { ModbusAbstractRequestFromBuffer } from "./abstract-request";

const debug = require('debug')('modbus-server-request-handler')

export default class ModbusServerRequestHandler<FB extends ModbusAbstractRequestFromBuffer<any>> {
  public _fromBuffer: FB;
  public _requests: ModbusAbstractRequest[];
  public _buffer: Buffer;

  constructor(fromBufferMethod: FB) {
    this._fromBuffer = fromBufferMethod
    this._requests = []
    this._buffer = Buffer.alloc(0)
  }

  shift() {
    return this._requests.shift()
  }

  handle(data: Buffer) {
    this._buffer = Buffer.concat([this._buffer, data])
    debug('this._buffer', this._buffer)

    do {
      const request = this._fromBuffer(this._buffer)
      debug('request', request)

      if (!request) {
        return
      }

      if (request instanceof ModbusRTURequest && request.corrupted) {
        const corruptDataDump = this._buffer.slice(0, request.byteCount).toString('hex')
        debug(`request message was corrupt: ${corruptDataDump}`)
      } else {
        this._requests.unshift(request)
      }



      this._buffer = this._buffer.slice(request.byteCount)
    } while (1)
  }
}
