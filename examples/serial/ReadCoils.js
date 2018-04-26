'use strict'

let modbus = require('../../')
let SerialPort = require('serialport')
let socket = new SerialPort('/dev/ttyUSB1', {
  baudRate: 115200,
  parity: 'even',
  stopBits: 1,
  dataBits: 8
})
let client = new modbus.client.RTU(socket, 0x01)

socket.on('open', function () {
  client.readCoils(process.argv[4], process.argv[5])
    .then(function (resp) {
      console.log(resp)
      socket.end()
    }).catch(function () {
      console.error(arguments)
      socket.end()
    })
})

socket.on('error', console.error)
