'use strict'

const ModbusServer = require('./modbus-server.js')
const ModbusServerClient = require('./modbus-server-client.js')
const Request = require('./rtu-request.js')
const Response = require('./rtu-response.js')

class ModbusRTUServer extends ModbusServer {
	public _socket: any;
	public emit: any;

  constructor (socket, options) {
    super(options)
    this._socket = socket
    const client = new ModbusServerClient(this, socket, Request, Response)
    this.emit('connection', client)
  }
}

module.exports = ModbusRTUServer
