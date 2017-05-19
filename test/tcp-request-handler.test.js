'use strict'

/* global describe, it, beforeEach */
let assert = require('assert')
let sinon = require('sinon')
let EventEmitter = require('events')
let TCPRequestHandler = require('../src/tcp-client-request-handler.js')
let ReadCoilsRequest = require('../src/request/read-coils.js')

describe('TCP Modbus Request Tests', function () {
  let socket
  let socketMock

  beforeEach(function () {
    socket = new EventEmitter()
    socket.write = function () { }

    socketMock = sinon.mock(socket)
  })

  /* we are using the read coils request function to test tcp-requests. */
  it('should write a tcp request.', function () {
    let handler = new TCPRequestHandler(socket, 3)
    let readCoilsRequest = new ReadCoilsRequest(0xa0fa, 0x0120)
    let requestBuffer = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x03, 0x01, 0xa0, 0xfa, 0x01, 0x20])

    socket.emit('connect')

    socketMock.expects('write').once().withArgs(requestBuffer)

      /* should flush the request right away */
    let promise = handler.register(readCoilsRequest)

    assert.ok(promise instanceof Promise)

    socketMock.verify()
  })
})
