

var Put     = require('put'),
    util    = require('util'),
    log     = function (msg) { util.log(msg); };

exports.setLogger = function (logger) {
    log = logger;
};

var ModbusServer = function (
    socket, 
    reqHandler, 
    resHandler) {

        if (!(this instanceof ModbusServer)) {
            return new ModbusServer(
                socket, 
                reqHandler, 
                resHandler);
        }

        var that = this;

        this.reqHandler = reqHandler;
        this.resHandler = resHandler;

        // request handler
        this.handler = { };

        // initiate server
        that.socket = socket;

        socket.on('end', that.handleEnd(that));
        socket.on('data', that.handleData(that));

        var api = {

            addHandler: function (fc, handler) {
                that.handler[fc] = handler;
            }

        };

        return api;

    };

    var proto = ModbusServer.prototype;

    proto.handleData = function (that) {

        return function (pdu) {

            log('received data');

            // get fc and byteCount in advance
            var fc          = pdu.readUInt8(0),
                byteCount   = pdu.readUInt8(1);

            // get the pdu handler
            var reqHandler  = that.reqHandler[fc],
                callback    = that.handler[fc],
                resHandler  = that.resHandler[fc];

            if (!reqHandler || !callback || !resHandler) {

                // write a error/exception pkt to the 
                // socket with error code fc + 0x80 and
                // exception code 0x01 (Illegal Function)
                that.handleException(fc, 0x01);
                return;
            
            }

            var params = reqHandler(pdu);

            // if params contains a error attribute then
            // handle the error
            if (params && 'error' in params) {
                log('Request handler returned an error.');
                that.handleException(fc, params.error);
                return;
            }

            var resObj = callback.apply(null, params);
            var resPdu = resHandler.apply(that, resObj);

            // add mbdaHeader to resPdu and send it
            // with write

            that.socket.write(resPdu);

        };

    };

    proto.handleException = function (fc, exceptionCode) {

        // replace that with an appropriate modbus error
        var errPkt = Put() 
        .word8(fc + 0x80)
        .word8(exceptionCode)
        .buffer();

        this.socket.write(errPkt);

    };

    proto.listen = function (that) {

        return function () {
            var o = that.server.address();
            log('Listening on ' + o.address + ":" + o.port + ".");
        };

    };

    proto.handleConnection = function (that) {

        return function () {
            log("Connection established.");
        };

    };

    proto.handleError = function (e) {
        log('Error occured');
    };

    proto.handleEnd = function (that) {
        return function () {}; 
    };

    exports.create = ModbusServer;
