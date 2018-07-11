'use strict'

let debug = require('debug')('modbus tcp server')
let ModbusServer = require('./modbus-server')
let ModbusServerClient = require('./modbus-server-client.js')
let Request = require('./tcp-request.js')
let Response = require('./tcp-response.js')

class ModbusTCPServer extends ModbusServer {
  constructor (server, options) {
    super(options)
    this._server = server

    server.on('connection', this._onConnection.bind(this))
  }

  _onConnection (socket) {
    debug('new connection coming in')
    let client = new ModbusServerClient(this, socket, Request, Response)

    this.emit('connection', client)
  }
}

module.exports = ModbusTCPServer
