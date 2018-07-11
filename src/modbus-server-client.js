'use strict'

let debug = require('debug')('modbus tcp client socket')
let RequestHandler = require('./modbus-server-request-handler.js')
let ResponseHandler = require('./modbus-server-response-handler.js')

class ModbusServerClient {
  constructor (server, socket, Request, Response) {
    this._server = server
    this._socket = socket

    this._requestHandler = new RequestHandler(Request)
    this._responseHandler = new ResponseHandler(this._server, Response)

    this._socket.on('data', this._onData.bind(this))
  }

  get socket () {
    return this._socket
  }

  get server () {
    return this._server
  }

  _onData (data) {
    debug('new data coming in')
    this._requestHandler.handle(data)

    do {
      let request = this._requestHandler.shift()

      if (!request) {
        debug('no request to process')
        /* TODO: close client connection */
        break
      }

      this._responseHandler.handle(request, function (response) {
        this._socket.write(response, function () {
          debug('response flushed')
        })
      }.bind(this))
    } while (1)
  }
}

module.exports = ModbusServerClient
