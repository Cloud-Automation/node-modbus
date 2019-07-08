'use strict'

/* global describe, it, beforeEach */
const assert = require('assert')
const sinon = require('sinon')
const EventEmitter = require('events')
const TCPRequestHandler = require('../dist/tcp-client-request-handler.js').default
const ReadCoilsRequest = require('../dist/request/read-coils.js').default

describe('TCP Modbus Request Tests', function () {
  let socket
  let socketMock

  beforeEach(function () {
    socket = new EventEmitter()
    socket.write = function () {}

    socketMock = sinon.mock(socket)
  })

  /* we are using the read coils request function to test tcp-requests. */
  it('should write a tcp request.', function () {
    const handler = new TCPRequestHandler(socket, 3)
    const readCoilsRequest = new ReadCoilsRequest(0xa0fa, 0x0120)
    const requestBuffer = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x03, 0x01, 0xa0, 0xfa, 0x01, 0x20])

    socket.emit('connect')

    socketMock.expects('write').once().withArgs(requestBuffer).yields()

    /* should flush the request right away */
    const promise = handler.register(readCoilsRequest)

    assert.ok(promise instanceof Promise)

    socketMock.verify()
  })
})

process.on('unhandledRejection', function (err) {
  console.error(err)
})
