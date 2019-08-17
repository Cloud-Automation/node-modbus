import Modbus from '../../../';
import SerialPort, { OpenOptions } from 'serialport';

const options: OpenOptions = {
  baudRate: 115200,
  parity: 'even',
  stopBits: 1,
  dataBits: 8
}

const socket = new SerialPort('/dev/ttyUSB1', options);

const address = 0x01;
const client = new Modbus.client.RTU(socket, address);

const readStart = 0;
const readCount = 5;

socket.on('open', function () {

  client.readCoils(readStart, readCount)
    .then(({ metrics, request, response }) => {
      console.log('Transfer Time: ' + metrics.transferTime)
      console.log('Response Body Payload: ' + response.body.valuesAsArray)
      console.log('Response Body Payload As Buffer: ' + response.body.valuesAsBuffer)
    })
    .catch(handleErrors)
    .finally(() => socket.end())

})

socket.on('error', console.error)

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
