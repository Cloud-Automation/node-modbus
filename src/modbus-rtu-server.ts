

import ModbusServer, { ModbusServerOptions } from './modbus-server.js'
import ModbusServerClient from './modbus-server-client.js'
import ModbusRTURequest from './rtu-request.js'
import ModbusRTUResponse from './rtu-response.js'

import SerialPort from 'serialport';

export default class ModbusRTUServer extends ModbusServer {
  public _socket: any;
  public emit: any;

  constructor(socket: SerialPort, options?: Partial<ModbusServerOptions>) {
    super(options)
    this._socket = socket
    const client = new ModbusServerClient(this, socket, ModbusRTURequest.fromBuffer, ModbusRTUResponse.fromRequest as any)
    this.emit('connection', client)
  }
}
