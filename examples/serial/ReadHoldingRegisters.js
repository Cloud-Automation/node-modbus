let modbus = require('../../')
let SerialPort = require('serialport')
let socket = new SerialPort('/dev/ttyUSB0', {
  baudrate: 115200,
  parity: 'even',
  stopbits: 1
})

let client = new modbus.client.RTU(socket, 1)

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

