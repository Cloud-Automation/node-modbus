var stampit         = require('stampit'),
    Put             = require('put'),
    Net             = require('net'),
    ModbusCore      = require('./modbus-client-core.js');

module.exports = stampit()
    .compose(ModbusCore)
    .init(function () {
    
        var reqId = 0,
            currentRequestId = reqId,
            trashRequestId, 
            socket;
    
        var init = function () {

            this.setState('init');


            if (!this.unit_id) { this.unit_id = 0; }
            if (!this.protocol_version) { this.protocol_version = 0; }
            if (!this.port) { this.port = 502; }
            if (!this.host) { this.host = 'localhost'; }

            socket = new Net.Socket();

            socket.connect(this.port, this.host);

            socket.on('connect', onConnect);
            socket.on('end', onEnd);
            socket.on('error', onError);
            socket.on('data', onData);

            this.on('send', onSend);
            this.on('trashCurrentRequest', onTrashCurrentRequest);
            

        }.bind(this);

        var onConnect = function ()  {
      
            this.emit('connect');
            this.setState('ready');
        
        }.bind(this);

        var onEnd = function () {
        
           this.setState('closed'); 
        
        }.bind(this);

        var onError = function (err) {

            this.emit('error', err);        
        
        }.bind(this);

        var onData = function (data) {
 
            this.log('received data');

            var cnt = 0;

            while (cnt < data.length) {

                // 1. extract mbap

                var mbap    = data.slice(cnt, cnt + 7),
                    id      = mbap.readUInt16BE(0),
                    len     = mbap.readUInt16BE(4);

                if (id === trashRequestId) {
                
                    this.log('current mbap contains trashed request id.');

                    return;

                }

                cnt += 7;

                this.log('MBAP extracted');

                // 2. extract pdu

                var pdu = data.slice(cnt, cnt + len - 1);

                cnt += pdu.length;

                this.log('PDU extracted');

                // emit data event and let the 
                // listener handle the pdu

                this.emit('data', pdu);

            }
        
        }.bind(this);

        var onSend = function (pdu) {

            this.log('Sending pdu to the socket.');

            reqId += 1;

            var pkt = Put()
                .word16be(reqId)                 // transaction id
                .word16be(this.protocol_version) // protocol version
                .word16be(pdu.length + 1)        // pdu length
                .word8(this.unit_id)	         // unit id
                .put(pdu)                        // the actual pdu
                .buffer();

            currentRequestId = reqId;

            socket.write(pkt);
        
        }.bind(this);

        var onTrashCurrentRequest = function () {
        
            trashRequestId = currentRequestId;
        
        }.bind(this);

        this.close = function () {
        
            socket.end();
        
        };

        init();
    
    });
