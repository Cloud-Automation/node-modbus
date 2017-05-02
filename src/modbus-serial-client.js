'use strict'

let ModbusClient = require('./modbus-client.js')
let SerialRequestHandler = require('./serial-request-handler.js')
let SerialResponseHandler = require('./serial-response-handler.js')

class ModbusSerialClient extends ModbusClient {

  constructor (socket) {
    super(socket)

    this._requestHandler = new SerialRequestHandler(this._socket)
    this._responseHandler = new SerialResponseHandler()
  }

}

module.exports = ModbusSerialClient
