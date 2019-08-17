#!/usr/bin/env node

'use strict'

const net = require('net')
const modbus = require('../..')
const netServer = new net.Server()
const server = new modbus.server.TCP(netServer)

server.on('connection', function () {

})

netServer.listen(8502)
