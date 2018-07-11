'use strict'

let modbus = require('../..')
let Serialport = require('serialport')
let socket = new Serialport('COM6', {
  baudRate: 19200,
  Parity: 'none',
  stopBits: 1,
  dataBits: 8
})

// set Slave PLC ID
let client = new modbus.client.RTU(socket, 1)

socket.on('connect', function () {
  client.writeSingleRegister(5, 123).then(function (resp) {
    console.log(resp)
    socket.close()
  }).fail(function (err) {
    console.log(err)
    socket.close()
  })
})

socket.on('error', function (err) {
  console.log(err)
})
