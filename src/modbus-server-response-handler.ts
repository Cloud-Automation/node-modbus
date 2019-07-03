import ModbusServer from "./modbus-server";

import {
  ReadCoilsResponseBody,
  ReadDiscreteInputsResponseBody,
  ReadHoldingRegistersResponseBody,
  ReadInputRegistersResponseBody,
  WriteSingleCoilResponseBody,
  WriteMultipleCoilsResponseBody,
  WriteMultipleRegistersResponseBody,
  ExceptionResponseBody,
  WriteSingleRegisterResponseBody,
} from './response';

import {
  isReadCoilsRequestBody,
  isReadDiscreteInputsRequestBody,
  isReadHoldingRegistersRequestBody,
  isExceptionRequestBody,
  isReadInputRegistersRequestBody,
  isWriteSingleCoilRequestBody,
  isWriteSingleRegisterRequestBody,
  isWriteMultipleCoilsRequestBody,
  isWriteMultipleRegistersRequestBody,
} from './request';

import { FC, isFunctionCode } from "./codes";
import BufferUtils from './buffer-utils.js';
import { ModbusRequest } from "./user-request";
import { ModbusAbstractResponseFromRequest } from "./abstract-response";

const {
  bufferToArrayStatus,
  arrayStatusToBuffer
} = BufferUtils;


const debug = require('debug')('modbus tcp response handler')


export default class ModbusServerResponseHandler<FR extends ModbusAbstractResponseFromRequest> {
  public _server: ModbusServer;
  public _fromRequest: FR;

  constructor(server: ModbusServer, fromRequest: FR) {
    this._server = server
    this._fromRequest = fromRequest
  }


  public handle(request: ModbusRequest, cb: (buffer: Buffer) => void) {
    if (!request) {
      return null
    }

    // Check for exception request body
    if (isExceptionRequestBody(request.body)) {
      /* exception request */
      const responseBody = ExceptionResponseBody.fromRequest(request.body)
      const response = this._fromRequest(request, responseBody)
      cb(response.createPayload())
      return response
    }

    const fc = request.body.fc;

    if (isFunctionCode(fc)) {
      switch (fc) {

        case FC.READ_COIL:
          return this._handleReadCoil(request, cb)

        case FC.READ_DISCRETE_INPUT:
          return this._handleDiscreteInput(request, cb)

        case FC.READ_HOLDING_REGISTERS:
          return this._handleReadHoldingRegisters(request, cb);

        case FC.READ_INPUT_REGISTERS:
          return this._handleReadInputRegisters(request, cb);

        case FC.WRITE_SINGLE_COIL:
          return this._handleWriteSingleCoil(request, cb);

        case FC.WRITE_SINGLE_HOLDING_REGISTER:
          return this._handleWriteSingleHoldingRegister(request, cb);

        case FC.WRITE_MULTIPLE_COILS:
          return this._handleWriteMultipleCoils(request, cb);

        case FC.WRITE_MULTIPLE_HOLDING_REGISTERS:
          return this._handleWriteMultipleHoldingRegisters(request, cb);
      }
    }



    return;
  }

  private _handleReadCoil(request: ModbusRequest, cb: (buffer: Buffer) => void) {

    if (!isReadCoilsRequestBody(request.body)) {
      throw new Error(`InvalidRequestClass - Expected ReadCoilsRequestBody but received ${request.body.name}`);
    }

    if (!this._server.coils) {
      debug('no coils buffer on server, trying readCoils handler')
      this._server.emit('readCoils', request, cb)
      return
    }

    this._server.emit('preReadCoils', request, cb)

    const responseBody = ReadCoilsResponseBody.fromRequest(request.body, this._server.coils)
    const response = this._fromRequest(request, responseBody)
    const payload = response.createPayload()
    cb(payload)

    this._server.emit('postReadCoils', request, cb)

    return response
  }

  private _handleDiscreteInput(request: ModbusRequest, cb: (buffer: Buffer) => void) {

    if (!isReadDiscreteInputsRequestBody(request.body)) {
      throw new Error(`InvalidRequestClass - Expected ReadDiscreteInputsRequestBody but received ${request.body.name}`);
    }

    if (!this._server.discrete) {
      debug('no discrete input buffer on server, trying readDiscreteInputs handler')
      this._server.emit('readDiscreteInputs', request, cb)
      return
    }

    this._server.emit('preReadDiscreteInputs', request, cb)

    const responseBody = ReadDiscreteInputsResponseBody.fromRequest(request.body, this._server.discrete)
    const response = this._fromRequest(request, responseBody)
    const payload = response.createPayload()
    cb(payload)

    this._server.emit('postReadDiscreteInputs', request, cb)

    return response
  }

  private _handleReadHoldingRegisters(request: ModbusRequest, cb: (buffer: Buffer) => void) {

    if (!isReadHoldingRegistersRequestBody(request.body)) {
      throw new Error(`InvalidRequestClass - Expected ReadHoldingRegistersRequestBody but received ${request.body.name}`);
    }

    if (!this._server.holding) {
      debug('no holding register buffer on server, trying readHoldingRegisters handler')
      this._server.emit('readHoldingRegisters', request, cb)
      return
    }

    this._server.emit('preReadHoldingRegisters', request, cb)

    const responseBody = ReadHoldingRegistersResponseBody.fromRequest(request.body, this._server.holding)
    const response = this._fromRequest(request, responseBody)
    const payload = response.createPayload()
    cb(payload)

    this._server.emit('postReadHoldingRegisters', request, cb)

    return response
  }

  private _handleReadInputRegisters(request: ModbusRequest, cb: (buffer: Buffer) => void) {

    if (!isReadInputRegistersRequestBody(request.body)) {
      throw new Error(`InvalidRequestClass - Expected ReadInputRegistersRequestBody but received ${request.body.name}`);
    }

    if (!this._server.input) {
      debug('no input register buffer on server, trying readInputRegisters handler')
      this._server.emit('readInputRegisters', request, cb)
      return
    }

    this._server.emit('preReadInputRegisters', request, cb)

    const responseBody = ReadInputRegistersResponseBody.fromRequest(request.body, this._server.input)
    const response = this._fromRequest(request, responseBody)
    const payload = response.createPayload()
    cb(payload)

    this._server.emit('postReadInputRegisters', request, cb)

    return response
  }

  private _handleWriteSingleCoil(request: ModbusRequest, cb: (buffer: Buffer) => void) {

    if (!isWriteSingleCoilRequestBody(request.body)) {
      throw new Error(`InvalidRequestClass - Expected WriteSingleCoilRequestBody but received ${request.body.name}`);
    }

    if (!this._server.coils) {
      debug('no coils buffer on server, trying writeSingleCoil handler')
      this._server.emit('writeSingleCoil', request, cb)
      return
    }

    this._server.emit('preWriteSingleCoil', request, cb)

    const responseBody = WriteSingleCoilResponseBody.fromRequest(request.body)

    const address = request.body.address

    debug('Writing value %d to address %d', request.body.value, address)

    // find the byte that contains the coil to be written
    const oldValue = this._server.coils.readUInt8(Math.floor(address / 8))
    let newValue

    if (request.body.value !== 0xFF00 && request.body.value !== 0x0000) {
      debug('illegal data value')
      /* illegal data value */
      const responseBody = new ExceptionResponseBody(request.body.fc, 0x03)
      const response = this._fromRequest(request, responseBody)
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
      /* illegal data address */
      const responseBody = new ExceptionResponseBody(request.body.fc, 0x02)
      const response = this._fromRequest(request, responseBody)
      cb(response.createPayload())
      return response
    } else {
      this._server.coils.writeUInt8(newValue, Math.floor(address / 8))
    }

    const response = this._fromRequest(request, responseBody)
    const payload = response.createPayload()
    cb(payload)

    this._server.emit('postWriteSingleCoil', request, cb)

    return response
  }

  private _handleWriteSingleHoldingRegister(request: ModbusRequest, cb: (buffer: Buffer) => void) {

    if (!isWriteSingleRegisterRequestBody(request.body)) {
      throw new Error(`InvalidRequestClass - Expected WriteSingleRegisterRequestBody but received ${request.body.name}`);
    }

    if (!this._server.holding) {
      debug('no register buffer on server, trying writeSingleRegister handler')
      this._server.emit('writeSingleRegister', request, cb)
      return
    }

    this._server.emit('preWriteSingleRegister', request, cb)


    const responseBody = WriteSingleRegisterResponseBody.fromRequest(request.body)

    if (responseBody.address * 2 > this._server.holding.length) {
      debug('illegal data address')
      const ExceptionResponseBody = require('./response/exception.js')
      /* illegal data address */
      const responseBody = new ExceptionResponseBody(request.body.fc, 0x02)
      const response = this._fromRequest(request, responseBody)
      cb(response.createPayload())
      return response
    } else {
      this._server.holding.writeUInt16BE(responseBody.value, responseBody.address * 2)
    }

    const response = this._fromRequest(request, responseBody)
    const payload = response.createPayload()
    cb(payload)

    this._server.emit('postWriteSingleRegister', request, cb)

    return response
  }

  private _handleWriteMultipleCoils(request: ModbusRequest, cb: (buffer: Buffer) => void) {

    if (!isWriteMultipleCoilsRequestBody(request.body)) {
      throw new Error(`InvalidRequestClass - Expected WriteMultipleCoilsRequestBody but received ${request.body.name}`);
    }

    if (!this._server.coils) {
      debug('no coils buffer on server, trying writeMultipleCoils handler')
      this._server.emit('writeMultipleCoils', request, cb)
      return
    }

    this._server.emit('preWriteMultipleCoils', request, cb)



    const responseBody = WriteMultipleCoilsResponseBody.fromRequest(request.body)
    const oldStatus = bufferToArrayStatus(this._server.coils)
    const requestCoilValues = bufferToArrayStatus(request.body.valuesAsBuffer)
    const start = request.body.address
    const end = start + request.body.quantity

    const newStatus = oldStatus.map((byte, i) => {
      let value = byte;
      const inRange = (i >= start && i < end);

      if (inRange) {
        const newValue = requestCoilValues.shift();
        value = newValue !== undefined ? newValue : byte;
      }

      return value
    })

    this._server.emit('writeMultipleCoils', this._server.coils, oldStatus)
    this._server.coils.fill(arrayStatusToBuffer(newStatus))
    this._server.emit('postWriteMultipleCoils', this._server.coils, newStatus)

    const response = this._fromRequest(request, responseBody)
    const payload = response.createPayload()
    cb(payload)

    this._server.emit('postWriteMultipleCoils', request, cb)

    return response
  }

  private _handleWriteMultipleHoldingRegisters(request: ModbusRequest, cb: (buffer: Buffer) => void) {

    if (!isWriteMultipleRegistersRequestBody(request.body)) {
      throw new Error(`InvalidRequestClass - Expected WriteMultipleRegistersRequestBody but received ${request.body.name}`);
    }

    if (!this._server.holding) {
      debug('no register buffer on server, trying writeMultipleRegisters handler')
      this._server.emit('writeMultipleRegisters', request, cb)
      return
    }

    this._server.emit('preWriteMultipleRegisters', request, cb)

    const responseBody = WriteMultipleRegistersResponseBody.fromRequest(request.body)

    if (((request.body.address * 2) + request.body.values.length) > this._server.holding.length) {
      debug('illegal data address')
      /* illegal data address */
      const responseBody = new ExceptionResponseBody(request.body.fc, 0x02)
      const response = this._fromRequest(request, responseBody)
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

    const response = this._fromRequest(request, responseBody)
    const payload = response.createPayload()
    cb(payload)

    this._server.emit('postWriteMultipleRegisters', request, cb)

    return response
  }

}
