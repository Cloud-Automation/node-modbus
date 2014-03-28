
var Util    = require('util'),
    Put     = require('put'),
EventEmitter = require('events').EventEmitter;

var log = function (msg) { Util.log(msg); };

exports.setLogger = function (logger) {
    log = logger;
};

/**
 *  ModbusTCPServer handles the MBAP that is the
 *  additional header used for modbus tcp protocol.
 *  It get's initialised with a simple socket providing
 *  .on, .emit and .write methods
 */
var ModbusTCPServer = function (socket) {

    if (!(this instanceof ModbusTCPServer)) {
        return new ModbusTCPServer(socket);
    }

    EventEmitter.call(this);

    // listen for data and connection
    this._socket = socket;
    this._socket.on('data', this._handleData(this));

    // store the requests in this fifo and 
    // flush them later
    this.reqFifo = [];
    this.mbapFifo = [];

    // create a modbus tcp packet with mbap and pdu
    // and attach the packet to the packet pipe.
    this.write = function (pdu) {

        var mbap = this.mbapFifo.shift();

        var pkt = Put()
        .word16be(mbap.trans_id)     // transaction id
        .word16be(mbap.protocol_ver) // protocol version
        .word16be(pdu.length + 1)    // pdu length
        .word8(mbap.unit_id)         // unit id
        .put(pdu)                    // the actual pdu
        .buffer();

        this.reqFifo.push(pkt);          // pipe the packet
        this._flush();
    };

    this.flush = function () {
        this._flush();
    };

    // end the connection
    this.end = function () {
        this._socket.end();
    };

};

Util.inherits(ModbusTCPServer, EventEmitter);

var proto = ModbusTCPServer.prototype;

/**
 *  Flush the remainig packets.
 */
proto._flush = function () {

    while (this.reqFifo.length > 0) {
        var pkt = this.reqFifo.shift();
        this._socket.write(pkt);
    }
};

/**
 *  Handle the incoming data, cut out the mbap
 *  packet and send the pdu to the listener
 */
proto._handleData = function (that) {

    return function (data) {

        log('received data');

        var cnt = 0;

        while (cnt < data.length) {

            // 0. check package

            if (data.length < 7) {
                log('Package is too small, stop processing.');
                return;
            }

            // 1. extract mbap

            var mbap = data.slice(cnt, cnt + 7),
            len = mbap.readUInt16BE(4);

            that.mbapFifo.push({ 
                trans_id: mbap.readUInt16BE(0),
                protocol_ver: mbap.readUInt16BE(2),
                unit_id: mbap.readUInt8(6) }); 

                cnt += 7;

                log('MBAP extracted');

                // 2. extract

                if (data.length < cnt + len - 1) {
                    log('PDU is too small, stop processing.');
                    return;
                } 

                var pdu = data.slice(cnt, cnt + len - 1);

                cnt += pdu.length;

                log('PDU extracted');

                // emit data event and let the 
                // listener handle the pdu

                that.emit('data', pdu); 

        }

    };

};

exports.create = ModbusTCPServer;
