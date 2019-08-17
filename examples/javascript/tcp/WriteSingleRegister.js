'use strict'

const modbus = require('../..')
const net = require('net')
const socket = new net.Socket()
const options = {
  'host': '192.168.56.101',
  'port': '502'
}
const client = new modbus.client.TCP(socket)

socket.on('connect', function () {
  client.writeSingleRegister(1002, 333)
    .then(function (resp) {
      console.log(resp)
      socket.end()
    }).catch(function () {
      console.error(arguments)
      socket.end()
    })
})

socket.on('error', console.error)
socket.connect(options)
