'use strict'

let net = require('net')
let modbus = require('../..')
let netServer = new net.Server()
let holding = Buffer.alloc(10000)
let server = new modbus.server.TCP(netServer, {
  holding: holding
})

server.on('connection', function (client) {
  console.log('New Connection')
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

server.on('writeMultipleCoils', function (value) {
  console.log('Write multiple coils - Existing: ', value)
})

server.on('postWriteMultipleCoils', function (value) {
  console.log('Write multiple coils - Complete: ', value)
})

/* server.on('writeMultipleRegisters', function (value) {
  console.log('Write multiple registers - Existing: ', value)
}) */

server.on('postWriteMultipleRegisters', function (value) {
  console.log('Write multiple registers - Complete: ', holding.readUInt16BE(0))
})

server.on('connection', function (client) {

  /* work with the modbus tcp client */

})

server.coils.writeUInt16BE(0x0000, 0)
server.coils.writeUInt16BE(0x0000, 2)
server.coils.writeUInt16BE(0x0000, 4)
server.coils.writeUInt16BE(0x0000, 6)

server.discrete.writeUInt16BE(0x5678, 0)

server.holding.writeUInt16BE(0x0000, 0)
server.holding.writeUInt16BE(0x0000, 2)

server.input.writeUInt16BE(0xff00, 0)
server.input.writeUInt16BE(0xff00, 2)

console.log(process.argv[2])
netServer.listen(process.argv[2] || 8502)
