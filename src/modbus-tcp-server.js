'use strict'

const debug = require('debug')('modbus tcp server')
const ModbusServer = require('./modbus-server')
const ModbusServerClient = require('./modbus-server-client.js')
const Request = require('./tcp-request.js')
const Response = require('./tcp-response.js')

class ModbusTCPServer extends ModbusServer {
  constructor (server, options) {
    super(options)
    this._server = server

    server.on('connection', this._onConnection.bind(this))
  }

  _onConnection (socket) {
    debug('new connection coming in')
    const client = new ModbusServerClient(this, socket, Request, Response)

    this.emit('connection', client)
  }
}

module.exports = ModbusTCPServer
