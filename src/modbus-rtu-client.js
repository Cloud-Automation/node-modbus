'use strict'

let ModbusClient = require('./modbus-client.js')
let ModbusRTUClientRequestHandler = require('./rtu-client-request-handler.js')
let ModbusRTUClientResponseHandler = require('./rtu-client-response-handler.js')

/** This Client musst be initiated with a socket object that implements the event emitter
 * interface and fires a 'data' event with a buffer as a parameter. It also needs to
 * implement the 'write' method to send data to the socket.
 *
 * @example <caption>Create new Modbus/RTU Client</caption>
 * let Modbus = require('jsmodbus')
 * let SerialPort = require('serialport')
 * let socket = new SerialPort("/dev/tty/ttyUSB0", { "baudRate: 57600" })
 * let client = new Modbus.client.RTU(socket, address)
 *
 * @extends ModbusClient
 * @class
 */
class ModbusRTUClient extends ModbusClient {

  /** Creates a new Modbus/RTU Client.
   * @param {SerialSocket} socket The serial Socket.
   * @param {Number} address The address of the serial client.
   */
  constructor (socket, address) {
    super(socket)

    this._requestHandler = new ModbusRTUClientRequestHandler(this._socket, address)
    this._responseHandler = new ModbusRTUClientResponseHandler()
  }

}

module.exports = ModbusRTUClient
