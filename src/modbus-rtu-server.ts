
import ModbusServerClient from './modbus-server-client.js'
import ModbusServer, { IModbusServerOptions } from './modbus-server.js'
import ModbusRTURequest from './rtu-request.js'
import ModbusRTUResponse from './rtu-response.js'

import * as SerialPort from 'serialport'

export default class ModbusRTUServer extends ModbusServer {
  public _socket: any
  public emit: any

  constructor (socket: SerialPort, options?: Partial<IModbusServerOptions>) {
    super(options)
    this._socket = socket

    const fromBuffer = ModbusRTURequest.fromBuffer
    const fromRequest = ModbusRTUResponse.fromRequest as any
    const slaveId = options && typeof options.slaveId !== 'undefined' ? options.slaveId : -1
    const client = new ModbusServerClient(this, socket, fromBuffer, fromRequest, slaveId)
    this.emit('connection', client)
  }
}
