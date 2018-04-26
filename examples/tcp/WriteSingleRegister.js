'use strict'

let modbus = require('../..')
let net = require('net')
let socket = new net.Socket()
let options = {
  'host': '127.0.0.1',
  'port': '8502'
}
let client = new modbus.client.TCP(socket)

socket.on('connect', function () {
  client.writeSingleRegister(2, 102)
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
