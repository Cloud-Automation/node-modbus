const OUT_OF_SYNC = 'OutOfSync'
const OFFLINE = 'Offline'
const MODBUS_EXCEPTION = 'ModbusException'
const MANUALLY_CLEARED = 'ManuallyCleared';

const debug = require('debug')('client-request-handler')
import UserRequest, { PromiseUserRequest } from './user-request.js'
import { UserRequestError } from "./user-request-error";
import ExceptionResponseBody from './response/exception.js'
import { ModbusRequestBody } from './request';
import ModbusAbstractRequest from './abstract-request.js';
import ModbusAbstractResponse from './abstract-response.js';
import * as Stream from 'stream';
import { CastRequestBody } from './request-response-map.js';


/** Common Request Handler
 * @abstract
 */
export default abstract class MBClientRequestHandler<S extends Stream.Duplex, Req extends ModbusAbstractRequest> {
  protected _socket: S;
  protected _timeout: number;
  protected abstract _requests: UserRequest[];
  protected abstract _currentRequest: UserRequest | null | undefined;
  protected _state: 'offline' | 'online';

  /** Create a new Request handler for Client requests
   * @param {S extends Stream.Duplex} socket A net.Socket object.
   * @param {number} timeout The request timeout value in ms.
   */
  constructor(socket: S, timeout: number) {
    if (new.target === MBClientRequestHandler) {
      throw new TypeError('Cannot instantiate ModbusClientRequestHandler directly.')
    }
    this._socket = socket
    this._timeout = timeout
    this._state = 'offline'
  }

  protected _clearCurrentRequest() {
    if (!this._currentRequest) {
      return
    }
    this._currentRequest.done()
    this._currentRequest = null
  }

  protected _clearAllRequests() {
    this._clearCurrentRequest()

    while (this._requests.length > 0) {
      const req = this._requests.shift()
      if (req) {
        req.reject(new UserRequestError({
          'err': OUT_OF_SYNC,
          'message': 'rejecting because of earlier OutOfSync error'
        }))
      }
    }
  }

  protected _onConnect() {
    this._state = 'online'
  }

  protected _onClose() {
    this._state = 'offline'
    this._clearAllRequests()
  }

  public abstract register<R extends Req, B extends ModbusRequestBody>(requestBody: B): RegisterRequestReturnType<CastRequestBody<R, B>>

  /** Register a new request.
   * @param {ModbusAbstractRequest} requestBody A request body to execute a modbus function.
   * @returns A promise to handle the request outcome.
   */
  public registerRequest<R extends Req>(request: R): RegisterRequestReturnType<R> {

    const userRequest = new UserRequest(request, this._timeout)



    this._requests.push(userRequest)
    this._flush()

    return userRequest.promise
  }

  /** Handle a ModbusTCPResponse object.
   * @param {ModbusAbstractRequest} response A Modbus TCP Response.
   */
  public handle(response: ModbusAbstractResponse) {
    debug('incoming response')
    if (!response) {
      debug('well, sorry I was wrong, no response at all')
      return
    }

    const userRequest = this._currentRequest

    if (!userRequest) {
      debug('no current request, no idea where this came from')
      return
    }

    const request = userRequest.request

    /* check that response fc equals request id */
    // TODO: Check that the new isException logic works for all tests
    if (response.body.isException === false && response.body.fc !== request.body.fc) {
      debug('something is weird, request fc and response fc do not match.')
      /* clear all request, client must be reset */
      userRequest.reject(new UserRequestError({
        'err': OUT_OF_SYNC,
        'message': 'request fc and response fc does not match.'
      }))
      this._clearAllRequests()
      return
    }

    /* check if response is an exception */
    if (response.body instanceof ExceptionResponseBody) {
      debug('response is a exception')
      userRequest.reject(new UserRequestError({
        'err': MODBUS_EXCEPTION,
        'message': `A Modbus Exception Occurred - See Response Body`,
        'response': response
      }))
      this._clearCurrentRequest()
      this._flush()
      return
    }

    /* everything is fine, handle response */
    debug('resolving request')
    userRequest.resolve(response)

    this._clearCurrentRequest()

    /* start next request */
    this._flush()
  }

  /* execute next request */
  protected _flush() {
    debug('flushing')
    if (this._currentRequest !== null) {
      debug('executing another request, come back later')
      return
    }

    if (this._requests.length === 0) {
      debug('no request to be executed')
      return
    }

    this._currentRequest = this._requests.shift()

    if (this._state === 'offline') {
      debug('rejecting request immediatly, client offline')
      this._currentRequest && this._currentRequest.reject(new UserRequestError({
        'err': OFFLINE,
        'message': 'no connection to modbus server'
      }))
      this._clearCurrentRequest()
      /* start next request */
      setTimeout(this._flush.bind(this), 0)
      return
    }

    const payload = this._currentRequest && this._currentRequest.createPayload()

    debug('flushing new request', payload)

    this._currentRequest && this._currentRequest.start(() => {
      this._clearCurrentRequest()
      this._flush()
    })

    this._socket.write(payload, function (err) {
      debug('request fully flushed, ( error:', err, ')')
    })
  }

  /**
   * The current number of requests
   * in the handler cue
   */
  public get requestCount() {
    return this._requests.length;
  }


  /** 
   * Manually reject the first request in the cue
   */
  public manuallyRejectCurrentRequest() {
    if (this._currentRequest) {
      this._currentRequest.reject(new UserRequestError({
        'err': MANUALLY_CLEARED,
        'message': 'the request was manually cleared'
      }))
      this._flush();
    }
  }

  /**
   * Manually Reject a specified number of requests
   */
  public manuallyRejectRequests(numRequests: number) {
    for (let i = 0; i < numRequests; i++) {
      this.manuallyRejectCurrentRequest();
    }
  }

  /**
   * Manually reject all requests in the cue
   */
  public manuallylRejectAllRequests() {
    this.manuallyRejectRequests(this.requestCount);
  }

  /**
   * Reject current request with a custom error
   */
  public customErrorRequest(err: UserRequestError<any>) {
    if (this._currentRequest) {
      this._currentRequest.reject(err)
    }
  }
}

export type RegisterRequestReturnType<Req extends ModbusAbstractRequest> = PromiseUserRequest<Req>