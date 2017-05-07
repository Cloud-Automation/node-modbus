'use strict'

let debug = require('debug')('modbus tcp response handler')

class TCPResponseHandler {

  constructor (server) {
    this._server = server
    this._server.setMaxListeners(1)
  }

  _handleReadCoilsRequest (request, cb) {
    cb(new TCPResponse())
  }

  handle (request, cb) {
    /* read coils request */
    if (request.body.fc === 0x01) {
      if (!this._server.coils) {
        debug('no coils buffer on server, trying readCoils handler')
        this._server.emit('readCoils', request, cb)
        return
      }

      this._handleReadCoilsRequest(request, cb)
    }
  }

}

module.exports = TCPResponseHandler
