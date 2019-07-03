export type ErrorCode = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 11;

export const ErrorMessages = {
  0x01: 'ILLEGAL FUNCTION',
  0x02: 'ILLEGAL DATA ADDRESS',
  0x03: 'ILLEGAL DATA VALUE',
  0x04: 'SLAVE DEVICE FAILURE',
  0x05: 'ACKNOWLEDGE',
  0x06: 'SLAVE DEVICE BUSY',
  0x08: 'MEMORY PARITY ERROR',
  0x0A: 'GATEWAY PATH UNAVAILABLE',
  0x0B: 'GATEWAY TARGET DEVICE FAILED TO RESPOND'
} as const;

type IErrorMessage = typeof ErrorMessages;

type ErrorMessage = IErrorMessage[ErrorCode];

export function errorCodeToMessage(x: number): ErrorMessage;
export function errorCodeToMessage(x: ErrorCode): ErrorMessage;
export function errorCodeToMessage(x: any) {
  if (isErrorCode(x)) {
    return ErrorMessages[x];
  } else {
    throw new Error('')
  }
}

export function isErrorCode(x: any): x is ErrorCode {
  switch (x) {
    case 0x01:
    case 0x02:
    case 0x03:
    case 0x04:
    case 0x05:
    case 0x06:
    case 0x08:
    case 0x0A:
    case 0x0B:
      return true;
    default:
      return false;
  }
}