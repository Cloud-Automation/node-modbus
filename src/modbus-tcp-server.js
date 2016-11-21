var stampit             = require('stampit'),
    ModbusServerCore    = require('./modbus-server-core.js'),
    StateMachine        = require('stampit-state-machine'),
    net                 = require('net');

module.exports = stampit()
    .compose(ModbusServerCore)
    .compose(StateMachine)
    .init(function () {
    
        var server, socketCount = 0, fifo = [];
        var clients = [];
        var buffer  = new Buffer(0);

        var init = function () {
       
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

            server.on('disconnect', function (s) {
                this.emit('close', s.address());
            });
            
            server.listen(this.port, this.hostname, function (err) {
           
                if (err) {
                
                    this.log.debug('error while listening', err);
                    this.emit('error', err);
                }

            }.bind(this));
 
            this.log.debug('server is listening on port', this.hostname + ':' + this.port);

            this.on('newState_ready', flush);

            this.setState('ready');

        }.bind(this);

        var onSocketEnd = function (socket, socketId) {
        
            return function () {
                this.emit('close');
                this.log.debug('connection closed, socket', socketId);
            
            }.bind(this);
        
        }.bind(this);

        var onSocketData = function (socket, socketId) {
        
            return function (data) {

                this.log.debug('received data socket', socketId, data.byteLength);

                buffer = Buffer.concat([buffer, data]);

                while (buffer.length > 8) {

                    // 1. extract mbap

                    var len     = buffer.readUInt16BE(4);
                    var request = {
                        trans_id: buffer.readUInt16BE(0),
                        protocol_ver: buffer.readUInt16BE(2),
                        unit_id: buffer.readUInt8(6)
                    };

                    this.log.debug('MBAP extracted');

                    // 2. extract pdu
                    if (buffer.length < 7 + len - 1) {
                        break; // wait for next bytes
                    }

                    var pdu = buffer.slice(7, 7 + len - 1);

                    this.log.debug('PDU extracted');

                    // emit data event and let the
                    // listener handle the pdu

                    fifo.push({ request : request, pdu : pdu, socket : socket });

                    flush();

                    buffer = buffer.slice(pdu.length + 7, buffer.length);
                }
           
            }.bind(this);
        
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

        var onSocketError = function (socket, socketCount) {
        
            return function (e) {
                this.emit('error', e);
                this.logError('Socker error', e);
            
            }.bind(this);
        
        
        }.bind(this);

        var initiateSocket = function (socket) {
       
            socketCount += 1;

            socket.on('end', onSocketEnd(socket, socketCount));
            socket.on('data', onSocketData(socket, socketCount));
            socket.on('error', onSocketError(socket, socketCount));
        
        }.bind(this);    

        this.close = function (cb) {
        
          for(var c in clients) {
            clients[c].destroy()
          }

          server.close(function() {
            server.unref() 
            if(cb) { cb() } 
          });
        
        };

        init();
    
    
    });
