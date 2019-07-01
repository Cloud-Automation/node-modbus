'use strict'

const debug = require('debug')('modbus tcp response handler')

class ModbusServerResponseHandler {
	public _server: any;
	public _responseClass: any;
	public bufferToArrayStatus: any;
	public arrayStatusToBuffer: any;

  constructor (server, Response) {
    this._server = server
    this._responseClass = Response
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

      this._server.emit('preReadCoils', request, cb)

      const ReadCoilsResponseBody = require('./response/read-coils.js')
      const responseBody = ReadCoilsResponseBody.fromRequest(request.body, this._server.coils)
      const response = this._responseClass.fromRequest(request, responseBody)
      const payload = response.createPayload()
      cb(payload)

      this._server.emit('postReadCoils', request, cb)

      return response
    }
    /* read discrete input request */
    if (request.body.fc === 0x02) {
      if (!this._server.discrete) {
        debug('no discrete input buffer on server, trying readDiscreteInputs handler')
        this._server.emit('readDiscreteInputs', request, cb)
        return
      }

      this._server.emit('preReadDiscreteInputs', request, cb)

      const ReadDiscreteInputsResponseBody = require('./response/read-discrete-inputs.js')
      const responseBody = ReadDiscreteInputsResponseBody.fromRequest(request.body, this._server.discrete)
      const response = this._responseClass.fromRequest(request, responseBody)
      const payload = response.createPayload()
      cb(payload)

      this._server.emit('postReadDiscreteInputs', request, cb)

      return response
    }
    /* read holding registers request */
    if (request.body.fc === 0x03) {
      if (!this._server.holding) {
        debug('no holding register buffer on server, trying readHoldingRegisters handler')
        this._server.emit('readHoldingRegisters', request, cb)
        return
      }

      this._server.emit('preReadHoldingRegisters', request, cb)

      const ReadHoldingRegistersResponseBody = require('./response/read-holding-registers.js')
      const responseBody = ReadHoldingRegistersResponseBody.fromRequest(request.body, this._server.holding)
      const response = this._responseClass.fromRequest(request, responseBody)
      const payload = response.createPayload()
      cb(payload)

      this._server.emit('postReadHoldingRegisters', request, cb)

      return response
    }
    /* read input registers request */
    if (request.body.fc === 0x04) {
      if (!this._server.input) {
        debug('no input register buffer on server, trying readInputRegisters handler')
        this._server.emit('readInputRegisters', request, cb)
        return
      }

      this._server.emit('preReadInputRegisters', request, cb)

      const ReadInputRegistersResponseBody = require('./response/read-input-registers.js')
      const responseBody = ReadInputRegistersResponseBody.fromRequest(request.body, this._server.input)
      const response = this._responseClass.fromRequest(request, responseBody)
      const payload = response.createPayload()
      cb(payload)

      this._server.emit('postReadInputRegisters', request, cb)

      return response
    }
    /* write single coil request */
    if (request.body.fc === 0x05) {
      if (!this._server.coils) {
        debug('no coils buffer on server, trying writeSingleCoil handler')
        this._server.emit('writeSingleCoil', request, cb)
        return
      }

      this._server.emit('preWriteSingleCoil', request, cb)

      const WriteSingleCoilResponseBody = require('./response/write-single-coil.js')
      const responseBody = WriteSingleCoilResponseBody.fromRequest(request.body)

      const address = request.body.address

      debug('Writing value %d to address %d', request.body.value, address)

      // find the byte that contains the coil to be written
      const oldValue = this._server.coils.readUInt8(Math.floor(address / 8))
      let newValue

      if (request.body.value !== 0xFF00 && request.body.value !== 0x0000) {
        debug('illegal data value')
        const ExceptionResponseBody = require('./response/exception.js')
        /* illegal data value */
        const responseBody = new ExceptionResponseBody(request.body.fc, 0x03)
        const response = this._responseClass.fromRequest(request, responseBody)
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
        const ExceptionResponseBody = require('./response/exception.js')
        /* illegal data address */
        const responseBody = new ExceptionResponseBody(request.body.fc, 0x02)
        const response = this._responseClass.fromRequest(request, responseBody)
        cb(response.createPayload())
        return response
      } else {
        this._server.coils.writeUInt8(newValue, Math.floor(address / 8))
      }

      const response = this._responseClass.fromRequest(request, responseBody)
      const payload = response.createPayload()
      cb(payload)

      this._server.emit('postWriteSingleCoil', request, cb)

      return response
    }
    /* write single register request */
    if (request.body.fc === 0x06) {
      if (!this._server.holding) {
        debug('no register buffer on server, trying writeSingleRegister handler')
        this._server.emit('writeSingleRegister', request, cb)
        return
      }

      this._server.emit('preWriteSingleRegister', request, cb)

      const WriteSingleRegisterResponseBody = require('./response/write-single-register.js')
      const responseBody = WriteSingleRegisterResponseBody.fromRequest(request.body)

      if (responseBody.address * 2 > this._server.holding.length) {
        debug('illegal data address')
        const ExceptionResponseBody = require('./response/exception.js')
        /* illegal data address */
        const responseBody = new ExceptionResponseBody(request.body.fc, 0x02)
        const response = this._responseClass.fromRequest(request, responseBody)
        cb(response.createPayload())
        return response
      } else {
        this._server.holding.writeUInt16BE(responseBody.value, responseBody.address * 2)
      }

      const response = this._responseClass.fromRequest(request, responseBody)
      const payload = response.createPayload()
      cb(payload)

      this._server.emit('postWriteSingleRegister', request, cb)

      return response
    }

    /* write multiple coil request */
    if (request.body.fc === 0x0f) {
      if (!this._server.coils) {
        debug('no coils buffer on server, trying writeMultipleCoils handler')
        this._server.emit('writeMultipleCoils', request, cb)
        return
      }

      this._server.emit('preWriteMultipleCoils', request, cb)

      const {
        bufferToArrayStatus,
        arrayStatusToBuffer
      } = require('./buffer-utils.js')
      const WriteMultipleCoilsResponseBody = require('./response/write-multiple-coils.js')

      const responseBody = WriteMultipleCoilsResponseBody.fromRequest(request.body)
      const oldStatus = bufferToArrayStatus(this._server.coils)
      const requestCoilValues = bufferToArrayStatus(request.body.valuesAsBuffer)
      const start = request.body.address
      const end = start + request.body.quantity

      const newStatus = oldStatus.map((byte, i) => {
        return (i >= start && i < end) ? requestCoilValues.shift() : byte
      })

      this._server.emit('writeMultipleCoils', this._server.coils, oldStatus)
      this._server.coils.fill(arrayStatusToBuffer(newStatus))
      this._server.emit('postWriteMultipleCoils', this._server.coils, newStatus)

      const response = this._responseClass.fromRequest(request, responseBody)
      const payload = response.createPayload()
      cb(payload)

      this._server.emit('postWriteMultipleCoils', request, cb)

      return response
    }

    /* write multiple registers request */
    if (request.body.fc === 0x10) {
      if (!this._server.holding) {
        debug('no register buffer on server, trying writeMultipleRegisters handler')
        this._server.emit('writeMultipleRegisters', request, cb)
        return
      }

      this._server.emit('preWriteMultipleRegisters', request, cb)

      const WriteMultipleRegistersResponseBody = require('./response/write-multiple-registers.js')
      const responseBody = WriteMultipleRegistersResponseBody.fromRequest(request.body)

      if (((request.body.address * 2) + request.body.values.length) > this._server.holding.length) {
        debug('illegal data address')
        const ExceptionResponseBody = require('./response/exception.js')
        /* illegal data address */
        const responseBody = new ExceptionResponseBody(request.body.fc, 0x10)
        const response = this._responseClass.fromRequest(request, responseBody)
        cb(response.createPayload())
        return response
      } else {
        this._server.emit('writeMultipleRegisters', this._server.holding)
        console.log(request.body)
        this._server.holding.fill(request.body.values,
          request.body.address * 2,
          request.body.address * 2 + request.body.values.length)
        this._server.emit('postWriteMultipleRegisters', this._server.holding)
      }

      const response = this._responseClass.fromRequest(request, responseBody)
      const payload = response.createPayload()
      cb(payload)

      this._server.emit('postWriteMultipleRegisters', request, cb)

      return response
    }

    if (request.body.fc > 0x80) {
      /* exception request */

      const ExceptionResponseBody = require('./response/exception.js')
      const responseBody = ExceptionResponseBody.fromRequest(request.body)
      const response = this._responseClass.fromRequest(request, responseBody)
      cb(response.createPayload())
      return response
    }
  }
}

module.exports = ModbusServerResponseHandler
