import Debug = require('debug'); const debug = Debug('modbus tcp server')
import { Server, Socket } from 'net'
import ModbusServer, { IModbusServerOptions } from './modbus-server'
import ModbusServerClient from './modbus-server-client.js'
import ModbusTCPRequest from './tcp-request.js'
import ModbusTCPResponse from './tcp-response.js'

export default class ModbusTCPServer extends ModbusServer {
  public _server: Server | ModbusServer

  constructor (server: Server | ModbusServer, options?: Partial<IModbusServerOptions>) {
    super(options)
    this._server = server

    server.on('connection', this._onConnection.bind(this))
  }

  public _onConnection (socket: Socket) {
    debug('new connection coming in')

    const Request = ModbusTCPRequest.fromBuffer
    const Response = ModbusTCPResponse.fromRequest as any

    const client = new ModbusServerClient(this, socket, Request, Response)

    this.emit('connection', client)
  }
}
