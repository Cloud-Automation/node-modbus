const modbus = require('../../')
const { SerialPort } = require('serialport')
const socket = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 115200,
  parity: 'even',
  stopBits: 1
})

const client = new modbus.client.RTU(socket, 1)

socket.on('close', function () {
  console.log(arguments)
})

socket.on('open', function () {
  client.readInputRegisters(1000, 1)
    .then(function (resp) {
      console.log(resp)
      socket.close()
    }).catch(function () {
      console.error(arguments)
      socket.close()
    })
})

socket.on('data', function () {
  console.log(arguments)
})

socket.on('error', console.error)
