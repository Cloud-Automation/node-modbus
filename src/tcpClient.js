
var Util    = require('util'),
    Put     = require('put'),
EventEmitter = require('events').EventEmitter;

var log = function (msg) { Util.log(msg); };

exports.setLogger = function (logger) {
    log = logger;
};

var PROTOCOL_VERSION = 0,
    UNIT_ID = 1;

/**
 *  ModbusTCPClient handles the MBAP that is the
 *  additional header used for modbus tcp protocol.
 *  It get's initialised with a simple socket providing
 *  .on, .emit and .write methods
 */
var ModbusTCPClient = function (socket) {

    if (!(this instanceof ModbusTCPClient)) {
        return new ModbusTCPClient(socket);
    }

    EventEmitter.call(this);

    // listen for data and connection
    this._socket = socket;
    this._socket.on('data', this._handleData(this));
    this._socket.on('connect', this._handleConnection(this));
    this._socket.on('end', this._handleEnd(this));
    this._socket.on('error', this._handleError(this));
    this._socket.on('close', this._handleClose(this));

    // store the requests in this fifo and 
    // flush them later
    this.reqFifo = [];
    this.reqId = 0; 

    // create a modbus tcp packet with mbap and pdu
    // and attach the packet to the packet pipe.
    this.write = function (pdu) {

        var pkt = Put()
        .word16be(this.reqId++)      // transaction id
        .word16be(PROTOCOL_VERSION)  // protocol version
        .word16be(pdu.length + 1)    // pdu length
        .word8(UNIT_ID)              // unit id
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

Util.inherits(ModbusTCPClient, EventEmitter);

var proto = ModbusTCPClient.prototype;

/**
 *  When a connection is established the 'isConnected'
 *  flag is set and the 'connect' event is emitted to the 
 *  listener. Finally the piped packets get flushed.
 */
proto._handleConnection = function (that) {

    return function () {
        that.isConnected = true;
        that.emit('connect');
        that._flush();
    };
};

/**
 *  Flush the remainig packets.
 */
proto._flush = function () {
    if (!this.isConnected) {
        return;
    }

    while (this.reqFifo.length > 0) {
        var pkt = this.reqFifo.shift();
        this._socket.write(pkt);
    }
};

proto._handleEnd = function (that) {

    return function () {
        that.emit("end");
    };

};

proto._handleError = function (that) {

    return function () {
        //    that.emit("error");
    };
};

proto._handleClose = function (that) {

    return function () {
        that.emit('close');
    }; 

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

            // 1. extract mbap

            var mbap = data.slice(cnt, cnt + 7),
            len = mbap.readUInt16BE(4);

            cnt += 7;

            log('MBAP extracted');

            // 2. extract pdu

            var pdu =data.slice(cnt, cnt + len - 1);

            cnt += pdu.length;

            log('PDU extracted');

            // emit data event and let the 
            // listener handle the pdu

            that.emit('data', pdu); 

        }

    };

};

exports.create = ModbusTCPClient;
