'use strict'

let modbus = require('../..')
let net = require('net')
let socket = new net.Socket()
let options = {
  'host': process.argv[2],
  'port': process.argv[3]
}
let client = new modbus.client.TCP(socket)

// override logger function
socket.on('connect', function () {
  client.writeSingleRegister(process.argv[4], process.argv[5])
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
