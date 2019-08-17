import Modbus from '../../../dist/modbus';
import SerialPort, { OpenOptions } from 'serialport';

const options: OpenOptions = {
  baudRate: 19200,
  parity: 'none',
  stopBits: 1,
  dataBits: 8
}

const socket = new SerialPort('COM6', options)

const address = 0x01;
const client = new Modbus.client.RTU(socket, address)

const writeAddress = 5;
const writeValue = 123; // either 0, 1, or boolean

socket.on('connect', function () {

  client.writeSingleRegister(writeAddress, writeValue)
    .then(({ metrics, request, response }) => {
      console.log('Transfer Time: ' + metrics.transferTime)
      console.log('Response Function Code: ' + response.body.fc)
    })
    .catch(handleErrors)
    .finally(() => socket.close())

})

socket.on('error', function (err) {
  console.log(err)
})

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