'use strict'

/* global describe, it */
var sinon = require('sinon')
var modbus = require('../src/modbus-tcp-server.js')

/* some helper */
var createSocket = function (ip) {
  return {
    end: function () { },
    address: function () { return { address: ip } },
    on: function () { }
  }
}

var createServer = function () {
  return {
    on: function () { },
    listen: function () { }
  }
}

var createNet = function (server) {
  return {
    createServer: function () { return server }
  }
}

describe('Modbus Server Whitelist IPs Connection test.', function (done) {
  it('should connect normaly.', function (done) {
    let serverAPI = createServer()
    let netAPI = createNet(serverAPI)
    let socketAPI = createSocket('127.0.0.1')
    let socketMock = sinon.mock(socketAPI)
    let serverStub = sinon.stub(serverAPI, 'on')
    let netStub = sinon.stub(netAPI, 'createServer')

    netStub.returns(serverAPI)
    serverStub.yields(socketAPI)

    socketMock.expects('end').never()

    modbus({
      'injNet': netAPI,
      'whiteListIPs': [
        '127.0.0.1'
      ]
    })

    socketMock.verify()

    done()
  })

  it('should disconnect from server.', function (done) {
    let serverAPI = createServer()
    let netAPI = createNet(serverAPI)
    let socketAPI = createSocket('127.0.0.1')
    let socketMock = sinon.mock(socketAPI)
    let serverStub = sinon.stub(serverAPI, 'on')
    let netStub = sinon.stub(netAPI, 'createServer')

    netStub.returns(serverAPI)
    serverStub.yields(socketAPI)

    socketMock.expects('end').once()

    modbus({
      'injNet': netAPI,
      'whiteListIPs': [
        '127.0.0.2'
      ]
    })

    socketMock.verify()

    done()
  })
})
