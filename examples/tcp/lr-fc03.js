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
  setInterval(function () {
    client.readHoldingRegisters(0, 2)
      .then(function (resp) {}).catch(function () {
        console.error(arguments)
        socket.end()
      })
  }, 200)
})

socket.on('error', console.error)
socket.connect(options)
