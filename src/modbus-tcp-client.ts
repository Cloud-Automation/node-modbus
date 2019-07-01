'use strict'

const ModbusClient = require('./modbus-client.js')
const ModbusTCPClientRequestHandler = require('./tcp-client-request-handler.js')
const ModbusTCPClientResponseHandler = require('./tcp-client-response-handler.js')

/** This client must be initiated with a net.Socket object. The module does not handle reconnections
 * or anything related to keep the connection up in case of an unplugged cable or a closed server. See
 * the node-net-reconnect module for these issues.
 * @extends ModbusClient
 * @class
 * @example <caption>Create new Modbus/TCP Client</caption>
 * const net = require('net')
 * const socket = new net.Socket()
 * const client = new Modbus.tcp.Client(socket)
 *
 * socket.connect({'host' : hostname, 'port' : 502 })
 *
 * socket.on('connect', function () {
 *
 *  client.readCoils(...)
 *
 * })
 *
 */
class ModbusTCPClient extends ModbusClient {
	public _unitId: any;
	public _timeout: any;
	public _requestHandler: any;
	public _socket: any;
	public _responseHandler: any;

  /** Creates a new Modbus/TCP Client.
   * @param {net.Socket} socket The TCP Socket.
   * @param {Number} unitId Unit ID
   * @param {Number} timeout Timeout for requests in ms.
   */
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
    this._requestHandler = new ModbusTCPClientRequestHandler(this._socket, this._unitId, timeout)
    this._responseHandler = new ModbusTCPClientResponseHandler()
  }
}

module.exports = ModbusTCPClient
