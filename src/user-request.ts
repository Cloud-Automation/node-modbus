
import ModbusAbstractRequest from './abstract-request'
import { RequestToResponse } from './request-response-map'
import ModbusRTURequest from './rtu-request'
import ModbusTCPRequest from './tcp-request'
import { UserRequestError } from './user-request-error'
import { UserRequestMetrics } from './user-request-metrics'

import Debug = require('debug'); const debug = Debug('user-request')

export type ModbusRequest = ModbusTCPRequest | ModbusRTURequest
export interface IUserRequestResolve<Req extends ModbusAbstractRequest> {
  metrics: UserRequestMetrics
  request: Req
  response: RequestToResponse<Req>
}

export type PromiseUserRequest<Req extends ModbusAbstractRequest> = Promise<IUserRequestResolve<Req>>

/** Request created for the user. It contains the actual modbus request,
 * the timeout handler and the promise delivered from the readCoils method
 * in the client.
 * @export
 * @class UserRequest
 * @template ReqBody
 * @template ResBody
 */
export default class UserRequest<Req extends ModbusAbstractRequest = any> {
  protected readonly _request: Req
  protected readonly _timeout: number
  protected readonly _promise: PromiseUserRequest<Req>
  protected _resolve!: (value: IUserRequestResolve<Req>) => void
  protected _reject!: (err: UserRequestError<RequestToResponse<Req>>) => void
  protected _timer!: NodeJS.Timeout

  protected _metrics: UserRequestMetrics

  /**
   * Creates an instance of UserRequest.
   * @param {Req} request
   * @param {number} [timeout=5000]
   * @memberof UserRequest
   */
  constructor (request: Req, timeout: number = 5000) {
    debug('creating new user request with timeout', timeout)
    this._request = request
    this._timeout = timeout

    this._metrics = new UserRequestMetrics()

    this._promise = new Promise<IUserRequestResolve<Req>>((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  public createPayload () {
    return this._request.createPayload()
  }

  public start (cb: () => void) {
    this._metrics.startedAt = new Date()

    this._timer = setTimeout(() => {
      this._reject(new UserRequestError({
        err: 'Timeout',
        message: 'Req timed out'
      }))
      cb()
    }, this._timeout)
  }

  public get metrics () {
    return this._metrics
  }

  public done () {
    clearTimeout(this._timer)
  }

  get request () {
    return this._request
  }

  get timeout () {
    return this._timeout
  }

  get promise () {
    return this._promise
  }

  public resolve (response: RequestToResponse<Req>) {
    this._metrics.receivedAt = new Date()
    debug('request completed in %d ms (sat in cue %d ms)', this.metrics.transferTime, this.metrics.waitTime)
    return this._resolve({
      metrics: this.metrics,
      request: this._request,
      response
    })
  }

  get reject () {
    return this._reject
  }
}
