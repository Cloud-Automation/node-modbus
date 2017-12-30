'use strict'

let debug = require('debug')('modbus tcp server')
let EventEmitter = require('events')
let ModbusTCPClient = require('./tcp-server-client.js')

class ModbusTCPServer extends EventEmitter {

  constructor (server, options) {
    super()
    this._server = server
    this._options = options || { }

    this._coils = this._options.coils || Buffer.alloc(1024)
    this._discrete = this._options.discrete || Buffer.alloc(1024)
    this._holding = this._options.holding || Buffer.alloc(1024)
    this._input = this._options.input || Buffer.alloc(1024)

    server.on('connection', this._onConnection.bind(this))
  }

  _onConnection (socket) {
    debug('new connection coming in')
    let client = new ModbusTCPClient(this, socket)

    this.emit('connection', client)
  }

  get coils () {
    return this._coils
  }

  get discrete () {
    return this._discrete
  }
}

module.exports = ModbusTCPServer
