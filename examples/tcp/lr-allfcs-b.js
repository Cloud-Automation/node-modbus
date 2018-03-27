'use strict'

let modbus = require('../..')
let net = require('net')
let options = {
  'host': '127.0.0.1',
  'port': '8502'
}
let cycleDone = true
let openConnection = 0

setInterval(function () {
  if (!cycleDone) {
    return
  }

  cycleDone = false

  let socket = new net.Socket()
  let client = new modbus.client.TCP(socket)

  socket.on('end', function () {
    console.log('Open Connections %d', --openConnection)
    cycleDone = true
  })

  socket.on('connect', function () {
    console.log('Open Connections %d', ++openConnection)
    let fc01 = client.readCoils(0, 40)
    let fc02 = client.readDiscreteInputs(0, 40)
    let fc03 = client.readHoldingRegisters(0, 100)
    let fc04 = client.readInputRegisters(0, 100)

    let fc05StartAddress = Math.trunc(Math.random() * 1000)
    let fc05 = client.writeSingleCoil(fc05StartAddress, true)

    let fc06StartAddress = Math.trunc(Math.random() * 100)
    let fc06Value = Math.trunc(Math.random() * 0xFFFF)
    let fc06 = client.writeSingleRegister(fc06StartAddress, fc06Value)

    let fc0FStartAddress = Math.trunc(Math.random() * 100)
    let fc0FBufferSize = Math.trunc(Math.random() * 100)
    let fc0F = client.writeMultipleCoils(fc0FStartAddress, Buffer.alloc(fc0FBufferSize * 2))

    let fc10StartAddress = Math.trunc(Math.random() * 100)
    let fc10BufferSize = Math.trunc(Math.random() * 100)
    let fc10 = client.writeMultipleCoils(fc10StartAddress, Buffer.alloc(fc10BufferSize * 2))

    let allFcs = Promise.all([fc01, fc02, fc03, fc04, fc05, fc06, fc0F, fc10])

    allFcs.then(function () {
      socket.end()
    }, process.exit)
  }, 200)

  socket.on('error', console.error)
  socket.connect(options)
})
