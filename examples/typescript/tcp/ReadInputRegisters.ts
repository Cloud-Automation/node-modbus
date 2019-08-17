import Modbus from '../../..'
import { Socket, SocketConnectOpts } from 'net'

const socket = new Socket()

const options: SocketConnectOpts = {
  host: '127.0.0.1',
  port: 8502
}
const client = new Modbus.client.TCP(socket)

const readStart = 0;
const readCount = 2;

socket.on('connect', function () {
  client.readInputRegisters(readStart, readCount)
    .then(({ metrics, request, response }) => {
      console.log('Transfer Time: ' + metrics.transferTime)
      console.log('Response Body Payload: ' + response.body.valuesAsArray)
      console.log('Response Body Payload As Buffer: ' + response.body.valuesAsBuffer)
    })
    .catch(handleErrors)
    .finally(() => socket.end())
})

socket.on('error', console.error)
socket.connect(options)

function handleErrors(err: any) {
  if (Modbus.errors.isUserRequestError(err)) {
    switch (err.err) {
      case 'OutOfSync':
      case 'Protocol':
      case 'Timeout':
      case 'ManuallyCleared':
      case 'ModbusException':
      case 'Offline':
      case 'crcMismatch':
        console.log('Error Message: ' + err.message, 'Error' + 'Modbus Error Type: ' + err.err)
        break;
    }

  } else if (Modbus.errors.isInternalException(err)) {
    console.log('Error Message: ' + err.message, 'Error' + 'Error Name: ' + err.name, err.stack)
  } else {
    console.log('Unknown Error', err);
  }
}
