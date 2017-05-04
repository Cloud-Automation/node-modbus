let modbus = require('../../')
let SerialPort = require('serialport')
let socket = new SerialPort('/dev/ttyUSB0', {
  baudRate: 115200,
  parity: 'even',
  stopBits: 1,
  dataBits: 8
})
let client = new modbus.client.RTU(socket, 1)

socket.on('open', function () {
  client.readInputRegisters(1000, 1)
    .then(function (resp) {
      console.log(resp)
      socket.end()
    }).catch(function () {
      console.error(arguments)
      socket.end()
    })
})

socket.on('error', console.error)

