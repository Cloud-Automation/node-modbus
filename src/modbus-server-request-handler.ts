'use strict'

const debug = require('debug')('modbus-server-request-handler')

class RequestHandler {
	public _requestClass: any;
	public _requests: any;
	public _buffer: any;

  constructor (requestClass) {
    this._requestClass = requestClass
    this._requests = []
    this._buffer = Buffer.alloc(0)
  }

  shift () {
    return this._requests.shift()
  }

  handle (data) {
    this._buffer = Buffer.concat([this._buffer, data])
    debug('this._buffer', this._buffer)

    do {
      const request = this._requestClass.fromBuffer(this._buffer)
      debug('request', request)

      if (!request) {
        return
      }

      if (request.corrupted) {
        const corruptDataDump = this._buffer.slice(0, request.byteCount).toString('hex')
        debug(`request message was corrupt: ${corruptDataDump}`)
      } else {
        this._requests.unshift(request)
      }

      this._buffer = this._buffer.slice(request.byteCount)
    } while (1)
  }
}

module.exports = RequestHandler
