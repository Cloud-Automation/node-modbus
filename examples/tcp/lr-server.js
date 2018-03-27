#!/usr/bin/env node

'use strict'

let net = require('net')
let modbus = require('../..')
let netServer = new net.Server()
let server = new modbus.server.TCP(netServer)

server.on('connection', function () {
  console.log('new connection')
})

netServer.listen(8502)
