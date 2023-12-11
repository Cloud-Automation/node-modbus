
import ModbusRequestBody from './request/request-body'
import ModbusTCPResponse from './tcp-response'

import Debug = require('debug'); const debug = Debug('tcp-client-request-handler')
import { Socket } from 'net'
import MBClientRequestHandler from './client-request-handler.js'
import ModbusTCPRequest from './tcp-request.js'
import UserRequest from './user-request'
import { UserRequestError } from './user-request-error'

const OUT_OF_SYNC = 'OutOfSync'
const PROTOCOL = 'Protocol'

/** TCP Client Request Handler
 * Implements the behaviour for Client Requests for Modus/TCP.
 * @extends MBClientRequestHandler
 * @class
 */
export default class ModbusTCPClientRequestHandler extends MBClientRequestHandler<Socket, ModbusTCPRequest> {
  protected _requests: Array<UserRequest<ModbusTCPRequest>>
  protected _currentRequest: UserRequest<ModbusTCPRequest> | null | undefined
  private _requestId: number
  private _unitId: number

  /**
   * Creates an instance of ModbusTCPClientRequestHandler.
   * @param {Socket} socket net.Socket
   * @param {number} unitId Unit ID
   * @param {number} [timeout=5000] Timeout in ms for requests
   * @memberof ModbusTCPClientRequestHandler
   */
  constructor (socket: Socket, unitId: number, timeout: number = 5000) {
    super(socket, timeout)
    this._requestId = 0
    this._unitId = unitId
    this._requests = []
    this._currentRequest = null

    this._socket.on('connect', this._onConnect.bind(this))
    this._socket.on('close', this._onClose.bind(this))

  }

  // TODO: Find a better way then putting in the any overide
  public register<T extends ModbusRequestBody> (requestBody: T): any {
    this._requestId = (this._requestId + 1) % 0xFFFF
    debug(
      'registrating new request',
      'transaction id', this._requestId,
      'unit id', this._unitId,
      'length', requestBody.byteCount
    )

    const tcpRequest = new ModbusTCPRequest(this._requestId, 0x00, requestBody.byteCount + 1, this._unitId, requestBody)

    return super.registerRequest(tcpRequest)
  }

  public handle<T extends ModbusTCPResponse> (response: T) {
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
      debug(
        'something weird is going on, response transition id does not equal request transition id',
        response.id,
        request.id
      )
      /* clear all request, client must be reset */
      userRequest.reject(new UserRequestError({
        err: OUT_OF_SYNC,
        message: 'request fc and response fc does not match.',
        request
      }))
      this._clearAllRequests()
      return
    }

    /* check if protocol version of response is 0x00 */
    if (response.protocol !== 0x00) {
      debug('server responds with wrong protocol version')
      userRequest.reject(new UserRequestError({
        err: PROTOCOL,
        message: 'Unknown protocol version ' + response.protocol,
        request
      }))
      this._clearAllRequests()
      return
    }

    super.handle(response)
  }
}
