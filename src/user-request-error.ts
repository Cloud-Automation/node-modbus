import ModbusAbstractRequest from './abstract-request'
import ModbusAbstractResponse from './abstract-response'

export type UserRequestErrorCodes = 'OutOfSync' | 'Protocol' | 'Timeout' | 'ManuallyCleared' | 'ModbusException' | 'Offline' | 'crcMismatch'

export interface IUserRequestError<Res extends ModbusAbstractResponse, Req extends ModbusAbstractRequest> {
  err: UserRequestErrorCodes
  message: string
  response?: Res,
  request?: Req
}

export class UserRequestError<Res extends ModbusAbstractResponse, Req extends ModbusAbstractRequest>
    implements IUserRequestError<Res, Req> {
  public err: UserRequestErrorCodes
  public message: string
  public request?: Req
  public response?: Res
  constructor ({ err, message, response, request }: IUserRequestError<Res, Req>) {
    this.err = err
    this.message = message
    this.request = request
    this.response = response
  }
}

export function isUserRequestError (x: any): x is UserRequestError<any, any> {
  if (x instanceof isUserRequestError) {
    return true
  }

  if (typeof x !== 'object') {
    return false
  }

  if (x.err === undefined || typeof x.err !== 'string') {
    return false
  }

  if (x.message === undefined || typeof x.message !== 'string') {
    return false
  }

  return true
}
