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
    if (!request) {
      return null
    }

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
      if (!this._server.holding) {
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
      if (!this._server.input) {
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
    /* write single coil request */
    if (request.body.fc === 0x05) {
      if (!this._server.coils) {
        debug('no coils buffer on server, trying writeSingleCoil handler')
        this._server.emit('writeSingleCoil', request, cb)
        return
      }

      let WriteSingleCoilResponseBody = require('./response/write-single-coil.js')
      let responseBody = WriteSingleCoilResponseBody.fromRequest(request.body)

      let address = request.body.address

      debug('Writing value %d to address %d', request.body.value, address)

      // find the byte that contains the coil to be written
      let oldValue = this._server.coils.readUInt8(Math.floor(address / 8))
      let newValue

      if (request.body.value !== 0xFF00 && request.body.value !== 0x0000) {
        debug('illegal data value')
        let ExceptionResponseBody = require('./response/exception.js')
        /* illegal data value */
        let responseBody = new ExceptionResponseBody(request.body.fc, 0x03)
        let response = ModbusTCPResponse.fromRequest(request, responseBody)
        cb(response.createPayload())
        return response
      }

      // write the correct bit
      // if the value is true, the bit is set using bitwise or
      if (request.body.value === 0xFF00) {
        newValue = oldValue | Math.pow(2, address % 8)
      } else {
        newValue = oldValue & ~Math.pow(2, address % 8)
      }

      if (responseBody.address / 8 > this._server.coils.length) {
        debug('illegal data address')
        let ExceptionResponseBody = require('./response/exception.js')
        /* illegal data address */
        let responseBody = new ExceptionResponseBody(request.body.fc, 0x02)
        let response = ModbusTCPResponse.fromRequest(request, responseBody)
        cb(response.createPayload())
        return response
      } else {
        this._server.coils.writeUInt8(newValue, Math.floor(address / 8))
      }

      let response = ModbusTCPResponse.fromRequest(request, responseBody)
      let payload = response.createPayload()
      cb(payload)

      return response
    }
    /* write single register request */
    if (request.body.fc === 0x06) {
      if (!this._server.holding) {
        debug('no register buffer on server, trying writeSingleRegister handler')
        this._server.emit('writeSingleRegister', request, cb)
        return
      }

      let WriteSingleRegisterResponseBody = require('./response/write-single-register.js')
      let responseBody = WriteSingleRegisterResponseBody.fromRequest(request.body)

      if (responseBody.address * 2 > this._server.holding.length) {
        debug('illegal data address')
        let ExceptionResponseBody = require('./response/exception.js')
        /* illegal data address */
        let responseBody = new ExceptionResponseBody(request.body.fc, 0x02)
        let response = ModbusTCPResponse.fromRequest(request, responseBody)
        cb(response.createPayload())
        return response
      } else {
        this._server.holding.writeUInt16BE(responseBody.value, responseBody.address * 2)
      }

      let response = ModbusTCPResponse.fromRequest(request, responseBody)
      let payload = response.createPayload()
      cb(payload)

      return response
    }

    /* write multiple coil request */
    if (request.body.fc === 0x0f) {
      if (!this._server.coils) {
        debug('no coils buffer on server, trying writeMultipleCoils handler')
        this._server.emit('writeMultipleCoils', request, cb)
        return
      }

      let WriteMultipleCoilsResponseBody = require('./response/write-multiple-coils.js')
      let bufferUtils = require('./buffer-utils.js')
      let responseBody = WriteMultipleCoilsResponseBody.fromRequest(request.body)

      //Shift ouputs over so they can be used to replace current coil values
      let start_address = request.body.address
      let end_address = start_address + request.body.quantity
      let outputs = request.body.valuesAsBuffer
      let buffer = bufferUtils.bufferShift(start_address, end_address, outputs)

      //Ensure start byte is configured correctly
      let start_byte = Math.floor(start_address / 8)
      let first_byte = bufferUtils.firstByte(start_address, this._server.coils[start_byte], buffer[0])
      buffer[0] = first_byte

      //Ensure last byte is configured correctly
      let final_byte = Math.floor(end_address / 8)
      let last_byte = bufferUtils.lastByte(end_address, this._server.coils[final_byte], buffer[buffer.length - 1])
      buffer[buffer.length - 1] = last_byte

      this._server.emit('writeMultipleCoils', this._server.coils)
      this._server.coils.fill(buffer, start_byte, final_byte + 1)
      this._server.emit('postWriteMultipleCoils', this._server.coils)

      debug('Write Multiple Coils responseBody', responseBody)

      let response = ModbusTCPResponse.fromRequest(request, responseBody)
      let payload = response.createPayload()
      cb(payload)

      return response
    }

    /* write multiple registers request */
    if (request.body.fc === 0x10) {
      if (!this._server.holding) {
        debug('no register buffer on server, trying writeMultipleRegisters handler')
        this._server.emit('writeMultipleRegisters', request, cb)
        return
      }

      let WriteMultipleRegistersResponseBody = require('./response/write-multiple-registers.js')
      let responseBody = WriteMultipleRegistersResponseBody.fromRequest(request.body)

      if (responseBody.address * 2 > this._server.holding.length) {
        debug('illegal data address')
        let ExceptionResponseBody = require('./response/exception.js')
        /* illegal data address */
        let responseBody = new ExceptionResponseBody(request.body.fc, 0x10)
        let response = ModbusTCPResponse.fromRequest(request, responseBody)
        cb(response.createPayload())
        return response
      } else {
        this._server.emit('writeMultipleRegisters', this._server.holding)
        this._server.holding.fill(request.body.values,
                                request.body.address * 2, 
                                request.body.address * 2 + request.body.values.length + 1)
        this._server.emit('postWriteMultipleRegisters', this._server.holding)
      }

      let response = ModbusTCPResponse.fromRequest(request, responseBody)
      let payload = response.createPayload()
      cb(payload)

      return response
    }

    if (request.body.fc > 0x80) {
      /* exception request */

      let ExceptionResponseBody = require('./response/exception.js')
      let responseBody = ExceptionResponseBody.fromRequest(request.body)
      let response = ModbusTCPResponse.fromRequest(request, responseBody)
      cb(response.createPayload())
      return response
    }
  }
}

module.exports = TCPResponseHandler
