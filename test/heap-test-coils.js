'use strict'

const modbus = require('../')
const v8 = require('v8')
const Promise = require('bluebird')

const client = modbus.client.tcp.complete({
  'host': 'localhost',
  'port': 8888
})

client.connect()

client.on('connect', function () {
  let p = Promise.resolve()

  for (let i = 1; i < 1e5; i++) {
    p = p.then(client.readCoils(0, 13))
  }

  p.then(function () {
    let usedHeapSize = Math.floor(v8.getHeapStatistics().used_heap_size / 1e6)

    console.log('Heap:', usedHeapSize, 'MB')

    client.close()
  })
})
