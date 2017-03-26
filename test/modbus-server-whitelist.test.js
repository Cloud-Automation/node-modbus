'use strict'

/* global describe, it */
var stampit = require('stampit')
var net = require('net')
var modbus = require('../')

function initServer (whiteIP, port) {
  return stampit()
    .refs({
      'port': port,
      'responseDelay': 100,
      'coils': new Buffer(100000),
      'holding': new Buffer(100000),
      'whiteListIPs': [
        whiteIP
      ]
    }).compose(modbus.server.tcp.complete)
}

describe('Modbus Server Whitelist IPs Connection test.', function () {
  it('should connect normaly.', function (done) {
    let port = 8888
    let ss = initServer('127.0.0.1', port)
    ss()
    net.connect({port: port}, function () {
      done()
    })
  })

  it('should disconnect from server.', function (done) {
    let port = 8899
    let ss = initServer('127.0.0.66', port)
    ss()
    let client = net.connect({port: port})
    client.on('end', function () {
      done()
    })
  })
})
