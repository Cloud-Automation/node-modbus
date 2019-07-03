import { ModbusResponse } from "./user-request";

export type UserRequestErrorCodes = 'OutOfSync' | 'Protocol' | 'Timeout' | 'ManuallyCleared' | 'ModbusException' | 'Offline' | 'crcMismatch'

export interface IUserRequestError {
  err: UserRequestErrorCodes
  message: string
  response?: ModbusResponse
}

export class UserRequestError implements IUserRequestError {
  public err: UserRequestErrorCodes;
  public message: string;
  public response?: ModbusResponse;
  constructor({ err, message, response }: IUserRequestError) {
    this.err = err;
    this.message = message;
    this.response = response;
  }
}

export function isUserRequestError(x: any): x is UserRequestError {
  if (x instanceof isUserRequestError) {
    return true;
  }

  if (typeof x !== 'object') {
    return false;
  }

  if (x.err === undefined || typeof x.err !== 'string') {
    return false;
  }

  if (x.message === undefined || typeof x.message !== 'string') {
    return false
  }

  return true;
}
