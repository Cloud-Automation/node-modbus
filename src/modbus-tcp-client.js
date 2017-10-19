'use strict'

var stampit = require('stampit')

module.exports = stampit()
  .init(function () {
    var reqId = 0
    var currentRequestId = reqId
    var closedOnPurpose = false
    var reconnect = false
    var trashRequestId
    var buffer = Buffer.alloc(0)
    var socket
    var closed = true

    var init = function () {
      this.setState('init')

      if (!this.unitId) { this.unitId = 0 }
      if (!this.protocolVersion) { this.protocolVersion = 0 }
      if (!this.port) { this.port = 502 }
      if (!this.host) { this.host = 'localhost' }
      if (!this.autoReconnect) { this.autoReconnect = false }
      if (!this.reconnectTimeout) { this.reconnectTimeout = 0 }

      this.on('send', onSend)
      this.on('newState_error', onError)
      this.on('trashCurrentRequest', onTrashCurrentRequest)

      this.on('stateChanged', this.log.debug)
    }.bind(this)

    var connect = function () {
      this.setState('connect')

      if (!socket) {
        /* for testing you are able to inject a mocking object
         * a simple event object should do the trick */
        if (this.injectedSocket) {
          socket = this.injectedSocket
        } else {
          socket = require('net').Socket()
        }
        socket.on('connect', onSocketConnect)
        socket.on('close', onSocketClose)
        socket.on('error', onSocketError)
        socket.on('data', onSocketData)
      }

      socket.connect(this.port, this.host)
    }.bind(this)

    var onSocketConnect = function () {
      closed = false
      this.emit('connect')
      this.setState('ready')
    }.bind(this)

    var onSocketClose = function (hadErrors) {
      this.log.debug('Socket closed with error', hadErrors)

      this.setState('closed')
      this.emit('close')

      if (!closedOnPurpose && (this.autoReconnect || reconnect)) {
        setTimeout(function () {
          reconnect = false

          connect()
        }, this.reconnectTimeout || 0)
      }
    }.bind(this)

    var onSocketError = function (err) {
      this.logError('Socket Error', err)

      this.setState('error')
      this.emit('error', err)
    }.bind(this)

    var onSocketData = function (data) {
      this.log.debug('received data')

      buffer = Buffer.concat([buffer, data])

      while (buffer.length > 7) {
        // 1. extract mbap

        var id = buffer.readUInt16BE(0)
        var len = buffer.readUInt16BE(4)
        var protocolId = buffer.readUInt16BE(2)

        if (protocolId !== 0x0000) {
          this.log.debug('current mbap contains invalid protocol id.')
          this.setState('error')
          console.log(protocolId)
          this.emit('error', new Error('Socket out of sync, received invalid protocol id'))
          return
        }

        if (id === trashRequestId) {
          this.log.debug('current mbap contains trashed request id.')

          return
        }

        if (id !== currentRequestId) {
          this.log.debug('current mbap contains invalid request id.')
          this.setState('error')
          this.emit('error', new Error('Socket out of sync, received invalid request id'))
          return
        }

        /* Not all data received yet. */
        if (buffer.length < 7 + len - 1) {
          break
        }

        // 2. extract pdu

        var pdu = buffer.slice(7, 7 + len - 1)

        this.log.debug('PDU extracted')

        // emit data event and let the
        // listener handle the pdu

        this.emit('data', pdu)

        buffer = buffer.slice(pdu.length + 7, buffer.length)
      }
    }.bind(this)

    var onError = function () {
      this.logError('Client in error state.')

      socket.destroy()
    }.bind(this)

    var onSend = function (pdu) {
      this.log.debug('Sending pdu to the socket.')

      reqId = (reqId + 1) % 0xffff

      var head = Buffer.allocUnsafe(7)

      head.writeUInt16BE(reqId, 0)
      head.writeUInt16BE(this.protocolVersion, 2)
      head.writeUInt16BE(pdu.length + 1, 4)
      head.writeUInt8(this.unitId, 6)

      var pkt = Buffer.concat([head, pdu])

      currentRequestId = reqId

      socket.write(pkt)
    }.bind(this)

    var onTrashCurrentRequest = function () {
      trashRequestId = currentRequestId
    }

    this.connect = function () {
      this.setState('connect')

      connect()

      return this
    }

    this.reconnect = function () {
      if (!this.inState('closed')) {
        return this
      }

      closedOnPurpose = false
      reconnect = true

      this.log.debug('Reconnecting client.')

      socket.end()

      return this
    }

    this.close = function () {
      if (closed) {
        return this
      }

      closed = true
      closedOnPurpose = true

      this.log.debug('Closing client on purpose.')

      socket.end()

      return this
    }

    // following is required to test of stream processing
    // and is only during test active
    if (process.env.DEBUG) {
      this.getSocket = function () {
        return socket
      }
      this.setCurrentRequestId = function (id) {
        currentRequestId = id
      }
      this.registerOnSend = function (_onSend) {
        this.removeListener(onSend)
        this.on('send', _onSend.bind(this))
      }
    }

    init()
  })
