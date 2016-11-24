'use strict'

var modbus = require('../..')
var client = modbus.client.tcp.complete({
  'host': process.argv[2],
  'port': process.argv[3],
  'logEnabled': true,
  'logLevel': 'debug',
  'logTimestamp': true
})

// override logger function
client.on('connect', function () {
  var values = []

  process.argv.forEach(function (v, i) {
    if (i <= 3) {
      return
    }
    values.push(parseInt(v))
  })

  client.writeMultipleCoils(0, values).then(function (resp) {
    console.log(resp)
  }, console.error).finally(function () {
    client.close()
  })
})

client.on('error', console.error)
client.connect()
