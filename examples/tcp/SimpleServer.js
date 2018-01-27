'use strict'

let net = require('net')
let modbus = require('../..')
let netServer = new net.Server()
let server = new modbus.server.TCP(netServer, {
  'coils': Buffer.alloc(1024),
  'discrete': Buffer.alloc(1024),
  'holding': Buffer.alloc(1024),
  'input': Buffer.alloc(1024)
})

server.on('readCoils', function (request, response, send) {
  /* Implement your own */

  response.body.coils[0] = true
  response.body.coils[1] = false

  send(response)
})

server.on('readHoldingRegisters', function (request, response, send) {

  /* Implement your own */

})

server.on('preWriteSingleRegister', function (value, address) {
    console.log('Write Single Register')
    console.log('Original {register, value}: {', address, ',', server.holding.readUInt16BE(address), '}')
})

server.on('WriteSingleRegister', function (value, address) {
    console.log('New {register, value}: {', address, ',', server.holding.readUInt16BE(address), '}')
})

server.on('connection', function (client) {

  /* work with the modbus tcp client */

})

server.coils.writeUInt16BE(0x1234, 0)

server.discrete.writeUInt16BE(0x5678, 0)

server.holding.writeUInt16BE(0x0000, 0)
server.holding.writeUInt16BE(0x0000, 2)

server.input.writeUInt16BE(0xff00, 0)
server.input.writeUInt16BE(0xff00, 2)

netServer.listen(8502)
