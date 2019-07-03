

const debug = require('debug')('modbus tcp client socket')
import ModbusServerRequestHandler from './modbus-server-request-handler.js'
import ModbusServerResponseHandler from './modbus-server-response-handler.js'
import ModbusServer from './modbus-server.js';
import * as Stream from 'stream';
import { ModbusAbstractResponseFromRequest } from './abstract-response.js';
import { ModbusAbstractRequestFromBuffer } from './abstract-request.js';




export default class ModbusServerClient<
  S extends Stream.Duplex,
  ReqFromBufferMethod extends ModbusAbstractRequestFromBuffer,
  ResFromRequestMethod extends ModbusAbstractResponseFromRequest> {
  public _server: ModbusServer;
  public _socket: S;
  public _requestHandler: ModbusServerRequestHandler<ReqFromBufferMethod>;
  public _responseHandler: ModbusServerResponseHandler<ResFromRequestMethod>;

  constructor(server: ModbusServer, socket: S, fromBufferMethod: ReqFromBufferMethod, fromRequestMethod: ResFromRequestMethod) {
    this._server = server
    this._socket = socket

    this._requestHandler = new ModbusServerRequestHandler(fromBufferMethod)
    this._responseHandler = new ModbusServerResponseHandler(this._server, fromRequestMethod)

    this._socket.on('data', this._onData.bind(this))
  }

  get socket() {
    return this._socket
  }

  get server() {
    return this._server
  }

  _onData(data: Buffer) {
    debug('new data coming in')
    this._requestHandler.handle(data)

    do {
      const request = this._requestHandler.shift()

      if (!request) {
        debug('no request to process')
        /* TODO: close client connection */
        break
      }

      //TODO: Find a better to overwrite the type definition for request instead of using "any"
      this._responseHandler.handle(request as any, (response) => {
        this._socket.write(response, function () {
          debug('response flushed', response)
        })
      })
    } while (1)
  }
}
