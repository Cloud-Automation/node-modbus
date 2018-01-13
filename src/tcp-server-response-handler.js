'use strict'

let debug = require('debug')('modbus tcp response handler')
let ModbusTCPResponse = require('./tcp-response.js')
let ReadCoilsResponseBody = require('./response/read-coils.js')

class TCPResponseHandler {

  constructor (server) {
    this._server = server
    this._server.setMaxListeners(1)
  }

  _handleReadCoilsRequest (request, cb) {
    cb(new ModbusTCPResponse())
  }

  handle (request, cb) {
    /* read coils request */
    if (request.body.fc === 0x01) {
      if (!this._server.coils) {
        debug('no coils buffer on server, trying readCoils handler')
        this._server.emit('readCoils', request, cb)
        return
      }

      let responseBody = ReadCoilsResponseBody.fromRequest(request.body, this._server.coils)
      let response = ModbusTCPResponse.fromRequest(request, responseBody)
      let payload = response.createPayload()
      cb(payload)

      return response
    }
    /* read discrete input request */
    if (request.body.fc === 0x02) {
      if (!this._server.discrete) {
        debug('no discrete input buffer on server, trying readDiscreteInputs handler')
        this._server.emit('readDiscreteInputs', request, cb)
        return
      }

      let ReadDiscreteInputsResponseBody = require('./response/read-discrete-inputs.js')
      let responseBody = ReadDiscreteInputsResponseBody.fromRequest(request.body, this._server.discrete)
      let response = ModbusTCPResponse.fromRequest(request, responseBody)
      let payload = response.createPayload()
      cb(payload)

      return response
    }
    /* read holding registers request */
    if (request.body.fc === 0x03) {
      if (!this._server.holdingRegisters) {
        debug('no holding register buffer on server, trying readHoldingRegisters handler')
        this._server.emit('readHoldingRegisters', request, cb)
        return
      }

      let ReadHoldingRegistersResponseBody = require('./response/read-holding-registers.js')
      let responseBody = ReadHoldingRegistersResponseBody.fromRequest(request.body, this._server.holdingRegisters)
      let response = ModbusTCPResponse.fromRequest(request, responseBody)
      let payload = response.createPayload()
      cb(payload)

      return response
    }
    /* read input registers request */
    if (request.body.fc === 0x04) {
      if (!this._server.inputRegisters) {
        debug('no input register buffer on server, trying readInputRegisters handler')
        this._server.emit('readInputRegisters', request, cb)
        return
      }

      let ReadInputRegistersResponseBody = require('./response/read-input-registers.js')
      let responseBody = ReadInputRegistersResponseBody.fromRequest(request.body, this._server.inputRegisters)
      let response = ModbusTCPResponse.fromRequest(request, responseBody)
      let payload = response.createPayload()
      cb(payload)

      return response
    }
  }

}

module.exports = TCPResponseHandler
