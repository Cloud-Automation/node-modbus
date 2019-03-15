'use strict'

const debug = require('debug')('rtu-client-request-handler')
const ModbusRTURequest = require('./rtu-request.js')
const ModbusClientRequestHandler = require('./client-request-handler.js')
const CRC = require('crc')

/** Modbus/RTU Client Request Handler
 * Implements behaviour for Client Requests for Modbus/RTU
 * @extends ModbusClientRequestHandler
 * @class
 */
class ModbusRTUClientRequestHandler extends ModbusClientRequestHandler {
  /** Create a new ModbusRTUClientRequestHandler
   * @param {SerialSocket} socket Any serial Socket that implements the serialport interface
   * @param {address} address The serial address of the modbus slave
   */
  constructor (socket, address) {
    super(socket, 5000)
    this._address = address
    this._requests = []
    this._currentRequest = null

    this._socket.on('open', this._onConnect.bind(this))
  }

  register (requestBody) {
    debug('registrating new request')

    const request = new ModbusRTURequest(this._address, requestBody)

    return super.register(request)
  }

  handle (response) {
    debug('new response coming in')
    if (!response) {
      return
    }

    const userRequest = this._currentRequest

    if (!userRequest) {
      debug('something is strange, received a respone without a request')
      return
    }

    const buf = Buffer.concat([Buffer.from([response.address]), response.body.createPayload()])
    debug('create crc from response', buf)

    //const crc = CRC.crc16modbus(buf)

    //if (response.crc !== crc) {
    //  debug('CRC does not match', response.crc, '!==', crc)
    //  userRequest.reject({
    //    'err': 'crcMismatch',
    //    'message': 'the response payload does not match the crc'
    //  })
    //  this._clearAllRequests()
    //  return
    //}

    super.handle(response)
  }
}

module.exports = ModbusRTUClientRequestHandler
