'use strict'
var stampit = require('stampit')
var ModbusServerCore = require('./modbus-server-core.js')
var StateMachine = require('stampit-state-machine')
var ClientSocket = require('./modbus-tcp-server-client.js')

module.exports = stampit()
  .compose(ModbusServerCore)
  .compose(StateMachine)
  .init(function () {
    let server
    let socketList = []
    let fifo = []
    let clients = []

    let init = function () {
      if (!this.port) {
        this.port = 502
      }

      if (!this.hostname) {
        this.hostname = '0.0.0.0'
      }

      /* dependency injection for the net module */
      let net = this.injNet || require('net')

      server = net.createServer()

      server.on('connection', function (s) {
        let node = s.address()
        this.log.debug('new connection', node)

        if (this.whiteListIPs && this.whiteListIPs.indexOf(node.address) < 0) {
          this.log.debug('client connection REJECTED', node)
          s.end()
          return false
        }

        clients.push(s)
        initiateSocket(s)
      }.bind(this))

      server.listen(this.port, this.hostname, function (err) {
        if (err) {
          this.log.debug('error while listening', err)
          this.emit('error', err)
          return
        }
      }.bind(this))

      this.log.debug('server is listening on port', this.hostname + ':' + this.port)

      this.on('newState_ready', flush)

      this.setState('ready')
    }.bind(this)

    var flush = function () {
      if (this.inState('processing')) {
        return
      }

      if (fifo.length === 0) {
        return
      }

      this.setState('processing')

      var current = fifo.shift()

      this.onData(current.pdu, function (response) {
        this.log.debug('sending tcp data')

        var head = Buffer.allocUnsafe(7)

        head.writeUInt16BE(current.request.trans_id, 0)
        head.writeUInt16BE(current.request.protocol_ver, 2)
        head.writeUInt16BE(response.length + 1, 4)
        head.writeUInt8(current.request.unit_id, 6)

        var pkt = Buffer.concat([head, response])

        current.socket.write(pkt)

        this.setState('ready')
      }.bind(this))
    }.bind(this)

    var initiateSocket = function (socket) {
      let socketId = socketList.length

      var requestHandler = function (req) {
        fifo.push(req)
        flush()
      }

      var removeHandler = function () {
        socketList[socketId] = undefined
        /* remove undefined on the end of the array */
        for (let i = socketList.length - 1; i >= 0; i -= 1) {
          let cur = socketList[i]
          if (cur !== undefined) {
            break
          }

          socketList.splice(i, 1)
        }
        this.log.debug('Client connection closed, remaining clients. ', socketList.length)
      }.bind(this)

      let clientSocket = ClientSocket({
        socket: socket,
        socketId: socketId,
        onRequest: requestHandler,
        onEnd: removeHandler
      })

      socketList.push(clientSocket)
    }.bind(this)

    this.close = function (cb) {
      for (var c in clients) {
        clients[c].destroy()
      }

      server.close(function () {
        server.unref()
        if (cb) { cb() }
      })
    }

    init()
  })
