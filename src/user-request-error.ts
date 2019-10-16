import ModbusAbstractResponse from './abstract-response'

export type UserRequestErrorCodes = 'OutOfSync' | 'Protocol' | 'Timeout' | 'ManuallyCleared' | 'ModbusException' | 'Offline' | 'crcMismatch'

export interface IUserRequestError<Res extends ModbusAbstractResponse> {
  err: UserRequestErrorCodes
  message: string
  response?: Res
}

export class UserRequestError<Res extends ModbusAbstractResponse> implements IUserRequestError<Res> {
  public err: UserRequestErrorCodes
  public message: string
  public response?: Res
  constructor ({ err, message, response }: IUserRequestError<Res>) {
    this.err = err
    this.message = message
    this.response = response
  }
}

export function isUserRequestError (x: any): x is UserRequestError<any> {
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
