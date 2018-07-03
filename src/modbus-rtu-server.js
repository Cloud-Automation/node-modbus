'use strict'

let ModbusServer = require('./modbus-server.js')
let ModbusServerClient = require('./modbus-server-client.js')
let Request = require('./rtu-request.js')
let Response = require('./rtu-response.js')

class ModbusRTUServer extends ModbusServer {
  constructor (socket, options) {
    super(options)
    this._socket = socket
    let client = new ModbusServerClient(this, socket, Request, Response)
    this.emit('connection', client)
  }
}

module.exports = ModbusRTUServer
