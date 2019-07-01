'use strict'

const debug = require('debug')('modbus tcp client socket')
const RequestHandler = require('./modbus-server-request-handler.js')
const ResponseHandler = require('./modbus-server-response-handler.js')

class ModbusServerClient {
	public _server: any;
	public _socket: any;
	public _requestHandler: any;
	public _responseHandler: any;

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
      const request = this._requestHandler.shift()

      if (!request) {
        debug('no request to process')
        /* TODO: close client connection */
        break
      }

      this._responseHandler.handle(request, function (response) {
        this._socket.write(response, function () {
          debug('response flushed', response)
        })
      }.bind(this))
    } while (1)
  }
}

module.exports = ModbusServerClient
