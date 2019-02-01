'use strict'

const modbus = require('../..')
const Serialport = require('serialport')
const socket = new Serialport('COM6', {
  baudRate: 19200,
  Parity: 'none',
  stopBits: 1,
  dataBits: 8
})

// set Slave PLC ID
const client = new modbus.client.RTU(socket, 1)

socket.on('connect', function () {
  client.writeSingleCoil(4, true).then(function (resp) {
    console.log(resp)
    socket.close()
  }, function (err) {
    console.log(err)
    socket.close()
  })
})

socket.on('error', function (err) {
  console.log(err)
})
