'use strict'

const debug = require('debug')('tcp-client-request-handler')
const TCPRequest = require('./tcp-request.js')
const ModbusClientRequestHandler = require('./client-request-handler.js')

const OUT_OF_SYNC = 'OutOfSync'
const PROTOCOL = 'Protocol'

/** TCP Client Request Handler
 * Implements the behaviour for Client Requests for Modus/TCP.
 * @extends ModbusClientRequestHandler
 * @class
 */
class ModbusTCPClientRequestHandler extends ModbusClientRequestHandler {
  /** Create a new TCPClientRequestHandler
   * @param {net.Socket} socket net.Socket
   * @param {Number} unitId Unit ID
   * @param {Number} timeout Timeout in ms for requests
   */
  constructor (socket, unitId, timeout) {
    super(socket, timeout)
    this._requestId = 0
    this._unitId = unitId

    this._socket.on('connect', this._onConnect.bind(this))
    this._socket.on('close', this._onClose.bind(this))
  }

  register (requestBody) {
    this._requestId = (this._requestId + 1) % 0xFFFF
    debug('registrating new request', 'transaction id', this._requestId, 'unit id', this._unitId, 'length', requestBody.byteCount)

    const tcpRequest = new TCPRequest(this._requestId, 0x00, requestBody.byteCount + 1, this._unitId, requestBody)

    return super.register(tcpRequest)
  }

  handle (response) {
    if (!response) {
      return
    }

    const userRequest = this._currentRequest

    if (!userRequest) {
      debug('something is strange, received a respone without a request')
      return
    }

    const request = userRequest.request

    /* check if response id equals request id */
    if (response.id !== request.id) {
      debug('something weird is going on, response transition id does not equal request transition id', response.id, request.id)
      /* clear all request, client must be reset */
      userRequest.reject({
        'err': OUT_OF_SYNC,
        'message': 'request fc and response fc does not match.'
      })
      this._clearAllRequests()
      return
    }

    /* check if protocol version of response is 0x00 */
    if (response.protocol !== 0x00) {
      debug('server responds with wrong protocol version')
      userRequest.reject({
        'err': PROTOCOL,
        'message': 'Unknown protocol version ' + response.protocol
      })
      this._clearAllRequests()
      return
    }

    super.handle(response)
  }
}

module.exports = ModbusTCPClientRequestHandler
