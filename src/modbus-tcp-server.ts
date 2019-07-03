

const debug = require('debug')('modbus tcp server')
import ModbusServer, { ModbusServerOptions } from './modbus-server'
import ModbusServerClient from './modbus-server-client.js'
import ModbusTCPRequest from './tcp-request.js'
import ModbusTCPResponse from './tcp-response.js'
import { Socket } from 'net';

export default class ModbusTCPServer extends ModbusServer {
  public _server: ModbusServer;

  constructor(server: ModbusServer, options?: Partial<ModbusServerOptions>) {
    super(options)
    this._server = server

    server.on('connection', this._onConnection.bind(this))
  }

  _onConnection(socket: Socket) {
    debug('new connection coming in')
    const client = new ModbusServerClient(this, socket, ModbusTCPRequest.fromBuffer, ModbusTCPResponse.fromRequest as any)

    this.emit('connection', client)
  }
}
