'use strict'

const ModbusClient = require('./modbus-client.js')
const ModbusRTUClientRequestHandler = require('./rtu-client-request-handler.js')
const ModbusRTUClientResponseHandler = require('./rtu-client-response-handler.js')

/** This Client musst be initiated with a socket object that implements the event emitter
 * interface and fires a 'data' event with a buffer as a parameter. It also needs to
 * implement the 'write' method to send data to the socket.
 *
 * @example <caption>Create new Modbus/RTU Client</caption>
 * const Modbus = require('jsmodbus')
 * const SerialPort = require('serialport')
 * const socket = new SerialPort("/dev/tty/ttyUSB0", { "baudRate: 57600" })
 * const client = new Modbus.client.RTU(socket, address)
 *
 * @extends ModbusClient
 * @class
 */
class ModbusRTUClient extends ModbusClient {
	public _requestHandler: any;
	public _socket: any;
	public _responseHandler: any;

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
