'use strict'

var modbus = require('../..')
var client = modbus.client.tcp.complete({
  'host': process.argv[2],
  'port': process.argv[3],
  'unitId': 1,
  'logEnabled': true,
  'logLevel': 'debug'
})

client.on('connect', function () {
  client.readHoldingRegisters(process.argv[4], process.argv[5]).then(function (resp) {
    console.log(resp)
  }, console.error)
    .finally(function () {
      client.close()
    })
})

client.on('error', console.error)
client.connect()
