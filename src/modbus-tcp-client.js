'use strict'

let ModbusClient = require('./modbus-client.js')
let TCPRequestHandler = require('./tcp-request-handler.js')
let TCPResponseHandler = require('./tcp-response-handler.js')

class ModbusTCPClient extends ModbusClient {

  constructor (socket, unitId, timeout) {
    super(socket)
    this._unitId = unitId || 1
    this._timeout = timeout || 5000

    /* Simply set the request and response handler and you are done.
     * The request handler needs to implement the following methods
     *   - register(pdu) returns a promise
     * The response handler needs to implement the following methods
     *   - handelData(buffer)
     *   - shift () // get latest message from the socket
     *      and remove it internally
     */
    this._requestHandler = new TCPRequestHandler(this._socket, this._unitId, timeout)
    this._responseHandler = new TCPResponseHandler()
  }

}

module.exports = ModbusTCPClient
