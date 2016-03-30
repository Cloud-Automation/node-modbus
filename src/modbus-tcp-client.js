var stampit         = require('stampit'),
    Put             = require('put'),
    Net             = require('net'),
    ModbusCore      = require('./modbus-client-core.js');

module.exports = stampit()
    .compose(ModbusCore)
    .init(function () {
    
        var reqId               = 0,
            currentRequestId    = reqId,
            closedOnPurpose     = false,
            reconnect           = false,
            trashRequestId, 
            socket;
    
        var init = function () {

            this.setState('init');

            if (!this.unitId) { this.unitId = 0; }
            if (!this.protocolVersion) { this.protocolVersion = 0; }
            if (!this.port) { this.port = 502; }
            if (!this.host) { this.host = 'localhost'; }
            if (!this.autoReconnect) { this.autoReconnect = false; }

            this.on('send', onSend);
            this.on('newState_error', onError);
            this.on('trashCurrentRequest', onTrashCurrentRequest); 

            this.on('stateChanged', this.log.debug);

        }.bind(this);

        var connect = function () {

            this.setState('connect');

            if (!socket) {

                socket = new Net.Socket();

                socket.on('connect', onSocketConnect);
                socket.on('close', onSocketClose);
                socket.on('error', onSocketError);
                socket.on('data', onSocketData);
 
            }

            socket.connect(this.port, this.host);
       
        }.bind(this);

        var onSocketConnect = function ()  {
      
            this.emit('connect');
            this.setState('ready');
        
        }.bind(this);

        var onSocketClose = function (hadErrors) {

            this.log.debug('Socket closed with error', hadErrors);


            this.setState('closed'); 
            this.emit('close');

            if (!closedOnPurpose && (this.autoReconnect || reconnect)) {

                reconnect = false;
           
                connect();
            
            } 
       
        }.bind(this);

        var onSocketError = function (err) {

            this.logError('Socket Error', err);

            this.setState('error');
        
        }.bind(this);

        var onSocketData = function (data) {
 
            this.log.debug('received data');

            var cnt = 0;

            while (cnt < data.length) {

                // 1. extract mbap

                var mbap    = data.slice(cnt, cnt + 7),
                    id      = mbap.readUInt16BE(0),
                    len     = mbap.readUInt16BE(4);

                if (id === trashRequestId) {
                
                    this.log.debug('current mbap contains trashed request id.');

                    return;

                }

                cnt += 7;

                this.log.debug('MBAP extracted');

                // 2. extract pdu

                var pdu = data.slice(cnt, cnt + len - 1);

                cnt += pdu.length;

                this.log.debug('PDU extracted');

                // emit data event and let the 
                // listener handle the pdu

                this.emit('data', pdu);

            }
        
        }.bind(this);

        var onError = function () {

            this.logError('Client in error state.');

            socket.destroy();

        }.bind(this);


        var onSend = function (pdu) {

            this.log.debug('Sending pdu to the socket.');

            reqId += 1;

            var pkt = Put()
                .word16be(reqId)                 // transaction id
                .word16be(this.protocolVersion) // protocol version
                .word16be(pdu.length + 1)        // pdu length
                .word8(this.unitId)	             // unit id
                .put(pdu)                        // the actual pdu
                .buffer();

            currentRequestId = reqId;

            socket.write(pkt);
        
        }.bind(this);

        var onTrashCurrentRequest = function () {
        
            trashRequestId = currentRequestId;
        
        }.bind(this);

        this.connect = function () {
       
            this.setState('connect');

            connect();

            return this;
        
        };

        this.reconnect = function () {

            if (!this.inState('closed')) {
                return this;
            }

            closedOnPurpose = false;
            reconnect       = true;

            this.log.debug('Reconnecting client.');

            socket.end();

            return this;
        
        };

        this.close = function () {

            closedOnPurpose = true;

            this.log.debug('Closing client on purpose.');

            socket.end();

            return this;

        };

        init();
    
    });
