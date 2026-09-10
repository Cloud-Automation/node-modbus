
import { LIMITS } from './constants'
import MBClient from './modbus-client.js'
import ModbusRTUClientRequestHandler from './rtu-client-request-handler.js'
import ModbusRTUClientResponseHandler from './rtu-client-response-handler.js'

import { SerialPort } from 'serialport'
import ModbusRTURequest from './rtu-request.js'

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
 * @extends MBClient
 * @class
 */
export default class ModbusRTUClient extends MBClient<SerialPort, ModbusRTURequest> {
  protected _requestHandler: ModbusRTUClientRequestHandler
  protected _responseHandler: ModbusRTUClientResponseHandler

  /** Creates a new Modbus/RTU Client.
   * @param {SerialPort} socket The serial Socket.
   * @param {number} address The address of the serial client.
   * @param {number} [timeout=5000]
   * @param {number} [maxBufferSize=LIMITS.RTU_ADU_MAX] The number of bytes the receive buffer may hold
   */
  constructor (
    socket: SerialPort,
    address: number,
    timeout = 5000,
    maxBufferSize: number = LIMITS.RTU_ADU_MAX
  ) {
    super(socket)

    this._requestHandler = new ModbusRTUClientRequestHandler(socket, address, timeout)
    this._responseHandler = new ModbusRTUClientResponseHandler(maxBufferSize)
  }

  public get slaveId () {
    return this._requestHandler.address
  }

  public get unitId () {
    return this._requestHandler.address
  }

}
