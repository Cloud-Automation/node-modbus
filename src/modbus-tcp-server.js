var stampit             = require('stampit'),
    ModbusServerCore    = require('./modbus-server-core.js'),
    StateMachine        = require('stampit-state-machine'),
    Put                 = require('put'),
    net                 = require('net');

module.exports = stampit()
    .compose(ModbusServerCore)
    .compose(StateMachine)
    .init(function () {
    
        var server, socketCount = 0, fifo = [];

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

        var onSocketEnd = function (socket, socketId) {
        
            return function () {
            
                this.log.debug('connection closed, socket', socketId);
            
            }.bind(this);
        
        }.bind(this);

        var onSocketData = function (socket, socketId) {
        
            return function (data) {

                this.log.debug('received data socket',socketId, data.byteLength);

                // 1. extract mbap

                var mbap    = data.slice(0, 0 + 7),
                    len     = mbap.readUInt16BE(4);
                    request = { 
                        trans_id: mbap.readUInt16BE(0),
                        protocol_ver: mbap.readUInt16BE(2),
                        unit_id: mbap.readUInt8(6) 
                    }; 

                // 2. extract pdu

                var pdu = data.slice(7, 7 + len - 1);

                // emit data event and let the 
                // listener handle the pdu

                fifo.push({ request : request, pdu : pdu, socket : socket });

                flush();
           
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

                 var pkt = Put()
                    .word16be(current.request.trans_id)         // transaction id
                    .word16be(current.request.protocol_ver)     // protocol version
                    .word16be(response.length + 1)      // pdu length
                    .word8(current.request.unit_id)             // unit id
                    .put(response)                      // the actual pdu
                    .buffer();

                current.socket.write(pkt); 
           
                this.setState('ready');

            }.bind(this));
        
        }.bind(this);

        var onSocketError = function (socket, socketCount) {
        
            return function (e) {
            
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
        
            server.close(cb);
        
        };

        init();
    
    
    });
