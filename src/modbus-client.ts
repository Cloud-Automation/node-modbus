import Debug = require('debug'); const debug = Debug('modbus-client')

import * as Stream from 'stream'

import {
  ReadCoilsRequestBody,
  ReadDiscreteInputsRequestBody,
  ReadHoldingRegistersRequestBody,
  ReadInputRegistersRequestBody,
  WriteMultipleCoilsRequestBody,
  WriteMultipleRegistersRequestBody,
  WriteSingleCoilRequestBody,
  WriteSingleRegisterRequestBody
} from './request'

import ModbusAbstractRequest from './abstract-request.js'
import ModbusAbstractResponse from './abstract-response.js'
import MBClientRequestHandler from './client-request-handler.js'
import MBClientResponseHandler from './client-response-handler.js'
import { UserRequestError } from './errors'
import { CastRequestBody } from './request-response-map'
import { WriteMultipleCoilsResponseBody } from './response'
import { PromiseUserRequest } from './user-request.js'

/** Common Modbus Client
 * @abstract
 */
export default abstract class MBClient<S extends Stream.Duplex, Req extends ModbusAbstractRequest> {

  public abstract get slaveId (): number;
  public abstract get unitId (): number;

  /**
   * Connection state of the client. Either online or offline.
   */
  public get connectionState () {
    return this._requestHandler.state
  }

  public get socket () {
    return this._socket
  }

  /**
   * The current number of requests
   * in the handler cue
   */
  public get requestCount (): number {
    return this._requestHandler.requestCount
  }
  protected _socket: S

  protected abstract readonly _requestHandler: MBClientRequestHandler<S, Req>
  protected abstract readonly _responseHandler: MBClientResponseHandler

  /** Creates a new Modbus client object.
   * @param {Socket} socket A socket object
   * @throws {NoSocketException}
   */
  constructor (socket: S) {
    if (new.target === MBClient) {
      throw new TypeError('Cannot instantiate ModbusClient directly.')
    }
    this._socket = socket

    if (!socket) {
      throw new Error('NoSocketException.')
    }

    this._socket.on('data', this._onData.bind(this))
  }

  /**
   * Manually reject all requests in the cue
   */
  public manuallyRejectAllRequests () {
    return this._requestHandler.manuallyRejectAllRequests()
  }

  /**
   * Manually Reject a specified number of requests
   */
  public manuallyRejectRequests (numRequests: number) {
    return this._requestHandler.manuallyRejectRequests(numRequests)
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
  public readCoils (start: number, count: number) {
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
  public readDiscreteInputs (start: number, count: number) {
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
  public readHoldingRegisters (start: number, count: number) {
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
  public readInputRegisters (start: number, count: number) {
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
  public writeSingleCoil (address: number, value: boolean | 0 | 1) {
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
  public writeSingleRegister (address: number, value: number) {
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
  public writeMultipleCoils (start: number, values: boolean[]):
    PromiseUserRequest<CastRequestBody<Req, WriteMultipleCoilsRequestBody>>
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
  public writeMultipleCoils (start: number, values: Buffer, quantity: number):
    PromiseUserRequest<CastRequestBody<Req, WriteMultipleCoilsRequestBody>>
  public writeMultipleCoils (start: number, values: boolean[] | Buffer, quantity: number = 0) {
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
   * const buff = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC, 0xDE, 0xF0]);
   * client.writeMultipleRegisters(10, buff).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  public writeMultipleRegisters (start: number, values: number[] | Buffer) {
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

  /**
   * Manually Reject a specified number of requests
   */
  public manuallyClearRequests (numRequests: number): void {
    return this._requestHandler.manuallyRejectRequests(numRequests)
  }

  /**
   * Manually reject the first request in the cue
   */
  public manuallyRejectCurrentRequest (): void {
    return this._requestHandler.manuallyRejectCurrentRequest()
  }

  /**
   * Reject current request with a custom error
   */
  public customErrorRequest (err: UserRequestError<any>) {
    return this._requestHandler.customErrorRequest(err)
  }

  private _onData (data: Buffer) {
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
        this._requestHandler.handle(response) // TODO: Find a better way than overwriting the type as any
      }
    } while (1)
  }

}
