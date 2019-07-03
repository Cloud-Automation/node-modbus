const debug = require('debug')('modbus-client')

import * as Stream from 'stream';

import {
  ReadCoilsRequestBody,
  ReadDiscreteInputsRequestBody,
  ReadHoldingRegistersRequestBody,
  ReadInputRegistersRequestBody,
  WriteSingleCoilRequestBody,
  WriteSingleRegisterRequestBody,
  WriteMultipleCoilsRequestBody,
  WriteMultipleRegistersRequestBody,
} from './request'

import { PromiseUserRequest } from './user-request.js';
import ModbusClientResponseHandler from './client-response-handler.js';
import ModbusClientRequestHandler from './client-request-handler.js';
import ModbusAbstractRequest from './abstract-request.js';
import ModbusAbstractResponse from './abstract-response.js';
import { WriteMultipleCoilsResponseBody } from './response';

/** Common Modbus Client
 * @abstract
 */
export default abstract class ModbusClient<S extends Stream.Duplex, ReqType extends ModbusAbstractRequest, ResType extends ModbusAbstractResponse>{
  protected _socket: S;

  protected abstract readonly _requestHandler: ModbusClientRequestHandler<S, ReqType, ResType>;
  protected abstract readonly _responseHandler: ModbusClientResponseHandler<ResType>;

  public abstract get slaveId(): number;
  public abstract get unitId(): number;

  /** Creates a new Modbus client object.
   * @param {Socket} socket A socket object
   * @throws {NoSocketException}
   */
  constructor(socket: S) {
    if (new.target === ModbusClient) {
      throw new TypeError('Cannot instantiate ModbusClient directly.')
    }
    this._socket = socket

    if (!socket) {
      throw new Error('NoSocketException.')
    }

    this._socket.on('data', this._onData.bind(this))
  }

  private _onData(data: Buffer) {
    debug('received data')

    this._responseHandler.handleData(data)

    /* get latest message from message handler */

    do {
      const response = this._responseHandler.shift()

      /* no message was parsed by now, come back later */
      if (!response) {
        return
      }

      /* process the response in the request handler if unitId is a match */
      if (this.unitId === response.unitId) {
        this._requestHandler.handle(response) //TODO: Find a better way than overwriting the type as any
      }
    } while (1)
  }

  /** Execute ReadCoils Request (Function Code 0x01)
   * @param {number} start Start Address.
   * @param {number} count Coil Quantity.
   * @returns {Promise}
   * @example
   * client.readCoils(0, 10).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  public readCoils(start: number, count: number) {
    debug('issuing new read coils request')
    let request

    try {
      request = new ReadCoilsRequestBody(start, count)
    } catch (e) {
      debug('unknown request error occurred')
      return Promise.reject(e)
    }

    return this._requestHandler.register(request)
  }

  public get socket() {
    return this._socket;
  }

  /** Execute ReadDiscreteInputs Request (Function Code 0x02)
   * @param {number} start Start Address.
   * @param {number} count Coil Quantity.
   * @example
   * client.readDiscreteInputs(0, 10).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  public readDiscreteInputs(start: number, count: number) {
    debug('issuing new read discrete inputs request')
    let request
    try {
      request = new ReadDiscreteInputsRequestBody(start, count)
    } catch (e) {
      debug('unknown request error occurred')
      return Promise.reject(e)
    }

    return this._requestHandler.register(request)
  }

  /** Execute ReadHoldingRegisters Request (Function Code 0x03)
   * @param {number} start Start Address.
   * @param {number} count Coil Quantity.
   * @example
   * client.readHoldingRegisters(0, 10).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  public readHoldingRegisters(start: number, count: number) {
    debug('issuing new read holding registers request')
    let request
    try {
      request = new ReadHoldingRegistersRequestBody(start, count)
    } catch (e) {
      debug('unknown request error occurred')
      return Promise.reject(e)
    }

    return this._requestHandler.register(request)
  }

  /** Execute ReadInputRegisters Request (Function Code 0x04)
   * @param {number} start Start Address.
   * @param {number} count Coil Quantity.
   * @example
   * client.readInputRegisters(0, 10).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  public readInputRegisters(start: number, count: number) {
    debug('issuing new read input registers request')

    let request
    try {
      request = new ReadInputRegistersRequestBody(start, count)
    } catch (e) {
      debug('unknown request error occurred')
      return Promise.reject(e)
    }

    return this._requestHandler.register(request)
  }

  /** Execute WriteSingleCoil Request (Function Code 0x05)
   * @param {number} address Address.
   * @param {boolean | 0 | 1} value Value.
   * @example
   * client.writeSingleCoil(10, true).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  public writeSingleCoil(address: number, value: boolean | 0 | 1) {
    debug('issuing new write single coil request')

    let request
    try {
      request = new WriteSingleCoilRequestBody(address, value)
    } catch (e) {
      debug('unknown request error occurred')
      return Promise.reject(e)
    }

    return this._requestHandler.register(request)
  }

  /** Execute WriteSingleRegister Request (Function Code 0x06)
   * @param {number} address Address.
   * @param {number} value Value.
   * @example
   * client.writeSingleRegister(10, 1234).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  public writeSingleRegister(address: number, value: number) {
    debug('issuing new write single register request')
    let request
    try {
      request = new WriteSingleRegisterRequestBody(address, value)
    } catch (e) {
      debug('unknown request error occurred')
      return Promise.reject(e)
    }

    return this._requestHandler.register(request)
  }

  /** Execute WriteMultipleCoils Request (Function Code 0x0F)
   * @param {number} address Address.
   * @param {boolean[]} values Values either as an Array[Boolean] or a Buffer.
   * @returns {PromiseUserRequest<ReqType, ResType>}
   * @example
   * client.writeMultipleCoils(10, [true, false, true, false, true]).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  public writeMultipleCoils(start: number, values: boolean[]): PromiseUserRequest<ModbusAbstractRequest<WriteMultipleCoilsRequestBody>, ModbusAbstractResponse<WriteMultipleCoilsResponseBody>>
  /** Execute WriteMultipleCoils Request (Function Code 0x0F)
   * @param {Number} address Address.
   * @param { Buffer} values Values either as an Array[Boolean] or a Buffer.
   * @param {Number} [quantity] If you choose to use the Buffer for the values then you have to
   *   specify the quantity of bytes.
   * @returns {PromiseUserRequest<ReqType, ResType>}
   * @example
   * client.writeMultipleCoils(10, Buffer.from([0xdd]), 7).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  public writeMultipleCoils(start: number, values: Buffer, quantity: number): PromiseUserRequest<ModbusAbstractRequest<WriteMultipleCoilsRequestBody>, ModbusAbstractResponse<WriteMultipleCoilsResponseBody>>
  public writeMultipleCoils(start: number, values: boolean[] | Buffer, quantity: number = 0) {
    debug('issuing new write multiple coils request')

    let request
    try {

      if (values instanceof Buffer) {
        request = new WriteMultipleCoilsRequestBody(start, values, quantity)
      } else {
        request = new WriteMultipleCoilsRequestBody(start, values)
      }

    } catch (e) {
      debug('unknown request error occurred')
      return Promise.reject(e)
    }

    return this._requestHandler.register(request)
  }

  /** Execute WriteMultipleRegisters Request (Function Code 0x10)
   * @param {Number} address Address.
   * @param {Array|Buffer} values Values either as an Array[UInt16] or a Buffer.
   * @returns {Promise}
   * @example
   * client.writeMultipleRegisters(10, [0x1234, 0x5678, 0x9ABC, 0xDEF0]).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   * @example
   * client.writeMultipleRegisters(10, Buffer.from([0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC, 0xDE, 0xF0])).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  public writeMultipleRegisters(start: number, values: number[] | Buffer) {
    debug('issuing new write multiple registers request')

    let request
    try {
      request = new WriteMultipleRegistersRequestBody(start, values)
    } catch (e) {
      debug('unknown request error occurred')
      return Promise.reject(e)
    }

    return this._requestHandler.register(request)
  }
}
