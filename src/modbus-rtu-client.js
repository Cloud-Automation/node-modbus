'use strict'

let ModbusClient = require('./modbus-client.js')
let RTURequestHandler = require('./rtu-request-handler.js')
let RTUResponseHandler = require('./rtu-response-handler.js')

class ModbusRTUClient extends ModbusClient {

  constructor (socket, address) {
    super(socket)

    this._requestHandler = new RTURequestHandler(this._socket, address)
    this._responseHandler = new RTUResponseHandler()
  }

}

module.exports = ModbusRTUClient
