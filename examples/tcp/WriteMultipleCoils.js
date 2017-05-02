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
  var values = []

  process.argv.forEach(function (v, i) {
    if (i <= 3) {
      return
    }
    values.push(parseInt(v))
  })

  client.writeMultipleCoils(0, values)
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
