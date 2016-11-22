var stampit = require('stampit')
var Net = require('net')
var ModbusCore = require('./modbus-client-core.js')

module.exports = stampit()
  .compose(ModbusCore)
  .init(function () {
    var reqId = 0
    var currentRequestId = reqId
    var closedOnPurpose = false
    var reconnect = false
    var trashRequestId
    var socket

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
        socket = new Net.Socket()

        socket.on('connect', onSocketConnect)
        socket.on('close', onSocketClose)
        socket.on('error', onSocketError)
        socket.on('data', onSocketData)
      }

      socket.connect(this.port, this.host)
    }.bind(this)

    var onSocketConnect = function () {
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

      var cnt = 0

      while (cnt < data.length) {
        // 1. extract mbap

        var mbap = data.slice(cnt, cnt + 7)
        var id = mbap.readUInt16BE(0)
        var len = mbap.readUInt16BE(4)

        if (id === trashRequestId) {
          this.log.debug('current mbap contains trashed request id.')

          return
        }

        cnt += 7

        this.log.debug('MBAP extracted')

        // 2. extract pdu

        var pdu = data.slice(cnt, cnt + len - 1)

        cnt += pdu.length

        this.log.debug('PDU extracted')

        // emit data event and let the
        // listener handle the pdu

        this.emit('data', pdu)
      }
    }.bind(this)

    var onError = function () {
      this.logError('Client in error state.')

      socket.destroy()
    }.bind(this)

    var onSend = function (pdu) {
      this.log.debug('Sending pdu to the socket.')

      reqId += 1

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
      closedOnPurpose = true

      this.log.debug('Closing client on purpose.')

      socket.end()

      return this
    }

    init()
  })
