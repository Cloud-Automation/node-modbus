'use strict'
var stampit             = require('stampit')
var ModbusServerCore    = require('./modbus-server-core.js')
var StateMachine        = require('stampit-state-machine')
var net                 = require('net')
var ClientSocket        = require('./modbus-tcp-server-client.js')

module.exports = stampit()
  .compose(ModbusServerCore)
  .compose(StateMachine)
  .init(function () {

    let server
    let socketCount = 0
    let socketList = []
    let fifo = []
    let clients = []

    let init = function () {

      if (!this.port) {
        this.port = 502;
      }

      if (!this.hostname) {
        this.hostname = '0.0.0.0';
      }

      server = net.createServer();

      server.on('connection', function (s) {

        this.log.debug('new connection', s.address());

        clients.push(s);
        initiateSocket(s);

      }.bind(this));

      server.listen(this.port, this.hostname, function (err) {

        if (err) {

          this.log.debug('error while listening', err);
          this.emit('error', err);
          return;

        }

      }.bind(this));

      this.log.debug('server is listening on port', this.hostname + ':' + this.port);

      this.on('newState_ready', flush);

      this.setState('ready');

    }.bind(this);

   var flush = function () {

      if (this.inState('processing')) {
        return;
      }

      if (fifo.length === 0) {
        return;
      }

      this.setState('processing');

      var current = fifo.shift();

      this.onData(current.pdu, function (response) {

        this.log.debug('sending tcp data');

        var head = Buffer.allocUnsafe(7);

        head.writeUInt16BE(current.request.trans_id, 0);
        head.writeUInt16BE(current.request.protocol_ver, 2);
        head.writeUInt16BE(response.length + 1, 4);
        head.writeUInt8(current.request.unit_id, 6);

        var pkt = Buffer.concat([head, response]);

        current.socket.write(pkt); 

        this.setState('ready');

      }.bind(this));

    }.bind(this);

    var initiateSocket = function (socket) {

      socketCount += 1

      let socketId = socketList.length

      let request_handler = function (req) {
        fifo.push(req);
        flush();
      }

      let remove_handler = function () {
           
        socketList[socketId] = undefined
        /* remove undefined on the end of the array */
        for (let i = socketList.length - 1; i >= 0; i -= 1) {
          let cur = socketList[i];
          if (cur !== undefined)
            break

          socketList.splice(i, 1);
        }
        console.log(socketList)
      }

      let client_socket = ClientSocket({
        socket: socket,
        socketId: socketId,
        onRequest: request_handler,
        onEnd: remove_handler
      })

      socketList.push(client_socket)

    }.bind(this);    

    this.close = function (cb) {

      for(var c in clients) {
        clients[c].destroy();
      }

      server.close(function() {
        server.unref();
        if(cb) { cb(); } 
      });

    };

    init();


  });
