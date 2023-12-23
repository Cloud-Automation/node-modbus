import ModbusAbstractRequest, { ModbusAbstractRequestFromBuffer } from './abstract-request'
import ModbusRTURequest from './rtu-request'

import Debug = require('debug'); const debug = Debug('modbus-server-request-handler')

export default class ModbusServerRequestHandler<FB extends ModbusAbstractRequestFromBuffer<any>> {
  public _fromBuffer: FB
  public _requests: ModbusAbstractRequest[]
  public _buffer: Buffer
  public _slaveId: number

  constructor (fromBufferMethod: FB, slaveId: number = -1) {
    this._fromBuffer = fromBufferMethod
    this._requests = []
    this._buffer = Buffer.alloc(0)
    this._slaveId = slaveId
  }

  public shift () {
    return this._requests.shift()
  }

  public handle (data: Buffer) {
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
      } else if (request instanceof ModbusRTURequest && this._slaveId !== -1 && request.slaveId !== this._slaveId) {
        debug('request message not for this address')
      } else {
        this._requests.unshift(request)
      }

      this._buffer = this._buffer.slice(request.byteCount)
    } while (1)
  }
}
