'use strict'

var modbus = require('../..')
var client = modbus.client.tcp.complete({
  'host': process.argv[2],
  'port': process.argv[3],
  'autoReconnect': true,
  'reconnectTimeout': 5000,
  'logEnabled': true
}).connect()
var successCount = 0
var errorCount = 0
var reconnectCount = 0
var firstTime = true
var intId

var start = function () {
  console.log('Starting request...')

  client.readHoldingRegisters(process.argv[4], process.argv[5]).then(function (resp) {
    successCount += 1

    console.log('Success', successCount, 'Errors', errorCount, 'Reconnect', reconnectCount)

    console.log('Request finished successfull.')

    setTimeout(function () {
      start()
    }, 2000)
  }).fail(function (err) {
    console.error(err)

    errorCount += 1

    console.log('Success', successCount, 'Errors', errorCount, 'Reconnect', reconnectCount)

    console.log('Request finished UNsuccessfull.')
  })
}

client.on('connect', function () {
  console.log('client connected.')

  if (firstTime) {
    firstTime = false
  } else {
    reconnectCount += 1
  }

  start()
})

var stop = function () {
  clearInterval(intId)
}

var shutdown = function () {
  stop()

  client.close()
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

client.on('close', function () {
  console.log('Client closed, stopping interval.')

  stop()
})

client.on('error', function (err) {
  console.log('Client Error', err)
})

