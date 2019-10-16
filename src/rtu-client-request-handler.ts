

const debug = require('debug')('rtu-client-request-handler')
import ModbusRTURequest from './rtu-request.js'
import MBClientRequestHandler from './client-request-handler.js'
import CRC from 'crc'
import * as SerialSocket from 'serialport';
import ModbusRequestBody from './request/request-body.js';
import ModbusRTUResponse from './rtu-response.js';
import { UserRequestError } from "./user-request-error";
import UserRequest from './user-request.js';

/** Modbus/RTU Client Request Handler
 * Implements behaviour for Client Requests for Modbus/RTU
 * @extends MBClientRequestHandler
 * @class
 */
export default class ModbusRTUClientRequestHandler extends MBClientRequestHandler<SerialSocket, ModbusRTURequest> {
  protected _requests: UserRequest<ModbusRTURequest>[];
  protected _currentRequest: UserRequest<ModbusRTURequest> | null | undefined;
  protected readonly _address: number;
  protected _socket: any;
  protected _onConnect: any;
  protected _clearAllRequests: any;

  /**
   *Creates an instance of ModbusRTUClientRequestHandler.
   * @param {SerialSocket} socket Any serial Socket that implements the serialport interface
   * @param {number} address The serial address of the modbus slave
   * @param {number} [timeout=5000]
   * @memberof ModbusRTUClientRequestHandler
   */
  constructor(socket: SerialSocket, address: number, timeout: number = 5000) {
    super(socket, timeout)
    this._address = address
    this._requests = []
    this._currentRequest = null

    this._socket.on('open', this._onConnect.bind(this))
  }

  register<T extends ModbusRequestBody>(requestBody: T): any {//TODO: Find a better way then putting in the any overide
    debug('registrating new request')

    const request = new ModbusRTURequest(this._address, requestBody)

    return super.registerRequest(request)
  }

  handle<T extends ModbusRTUResponse>(response: T) {
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

    const crc = CRC.crc16modbus(buf)

    if (response.crc !== crc) {
      debug('CRC does not match', response.crc, '!==', crc)
      userRequest.reject(new UserRequestError({
        'err': 'crcMismatch',
        'message': 'the response payload does not match the crc'
      }))
      this._clearAllRequests()
      return
    }

    super.handle(response)
  }

  public get address() {
    return this._address;
  }
}
