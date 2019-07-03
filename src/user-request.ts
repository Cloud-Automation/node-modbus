

import ModbusTCPRequest from "./tcp-request";
import ModbusRTURequest from "./rtu-request";
import ModbusTCPResponse from "./tcp-response";
import ModbusRTUResponse from "./rtu-response";
import { UserRequestError } from "./user-request-error";
import ModbusAbstractRequest from "./abstract-request";
import ModbusAbstractResponse from "./abstract-response";

const debug = require('debug')('user-request')

type Either<A, B> = A | B;

export type ModbusRequest = Either<ModbusTCPRequest, ModbusRTURequest>;
// export type ModbusResponse = Either<ModbusTCPResponse, ModbusRTUResponse>;

export interface UserRequestResolve<Req extends ModbusAbstractRequest, Res extends ModbusAbstractResponse> {
  request: Req;
  response: Res;
}

export type PromiseUserRequest<Req extends ModbusAbstractRequest, Res extends ModbusAbstractResponse> = Promise<UserRequestResolve<Req, Res>>;

/** Request created for the user. It contains the actual modbus request,
 * the timeout handler and the promise delivered from the readCoils method
 * in the client.
 * @export
 * @class UserRequest
 * @template ReqBody
 * @template ResBody
 */
export default class UserRequest<Req extends ModbusAbstractRequest, Res extends ModbusAbstractResponse> {
  protected _request: Req;
  protected _timeout: number;
  protected _promise: Promise<UserRequestResolve<Req, Res>>;
  protected _resolve!: (value: UserRequestResolve<Req, Res>) => void;
  protected _reject!: (err: UserRequestError<Res>) => void;
  protected _timer!: NodeJS.Timeout;

  /**
   * Creates an instance of UserRequest.
   * @param {Req} request
   * @param {number} [timeout=5000]
   * @memberof UserRequest
   */
  constructor(request: Req, timeout: number = 5000) {
    debug('creating new user request with timeout', timeout)
    this._request = request
    this._timeout = timeout

    this._promise = new Promise<UserRequestResolve<Req, Res>>((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  public createPayload() {
    return this._request.createPayload()
  }

  public start(cb: Function) {
    this._timer = setTimeout(() => {
      this._reject(new UserRequestError({
        'err': 'Timeout',
        'message': 'Req timed out'
      }))
      cb()
    }, this._timeout)
  }

  public done() {
    clearTimeout(this._timer)
  }

  get request() {
    return this._request
  }

  get timeout() {
    return this._timeout
  }

  get promise() {
    return this._promise
  }

  public resolve(response: Res) {
    return this._resolve({
      'response': response,
      'request': this._request
    })
  }

  get reject() {
    return this._reject
  }
}