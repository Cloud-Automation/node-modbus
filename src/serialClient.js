var util    = require('util'),
    Put     = require('put'),
    Q       = require('q');

var Handler = require('./handler');

var log = function (msg) { util.log(msg); };

exports.setLogger = function (logger) {
    log = logger;
};

var dummy                   = function () { },
    modbusProtocolVersion   = 0,
    modbusUnitIdentifier    = 1;

var ModbusClient = function (socket, resHandler) {

    if (!(this instanceof ModbusClient)) {
        return new ModbusClient(socket, resHandler);
    }

    var that = this;

    this.state = 'ready'; // ready or waiting (for response)

    this.resHandler = resHandler;

    this.isConnected = false;
    this.socket = socket;

    this.socket.on('connect', function () {
        // release pipe content if there are any yet
        log('Connection established.');
        that.isConnected = true;
        that.flush();
    });

    // setup data receiver
    this.socket.on('data', this.handleData(this));
    this.socket.on('close', this.handleClose(this));
    this.socket.on('end', this.handleEnd(this));

    // package and callback queues
    this.pipe = [];
    this.current = null;

    this.identifier = 0;

    /**
     *  Public functions, in general all implementations from 
     *  the function codes
     */
    var api = {

        readCoils: function (start, quantity, cb) {
            var fc      = 1,
                defer   = Q.defer(),
                pdu     = that.pduWithTwoParameter(fc, start, quantity);

            if (!cb) {

                that.makeRequest(fc, pdu, that.promiseCallback(defer));
                return defer.promise;
            
            }

            return that.makeRequest(fc, pdu, cb);
        
        },

        readHoldingRegister: function (start, quantity, cb) {
        
            var fc      = 3,
                defer   = Q.defer(),
                pdu     = that.pduWithTwoParameter(fc, start, quantity);

            if (!cb) {
             
                that.makeRequest(fc, pdu, that.promiseCallback(defer));
            
                return that.promise;

            }

            return that.makeRequest(fc, pdu, cb);
        
        },

        readInputRegister: function (start, quantity, cb) {

            var fc      = 4, 
                defer   = Q.defer(),
                pdu     = that.pduWithTwoParameter(fc, start, quantity);

            if (!cb) {

                that.makeRequest(fc, pdu, that.promiseCallback(defer));
                return defer.promise;
            
            }


            return that.makeRequest(fc, pdu, cb);

        },

        writeSingleCoil: function (address, value, cb) {

            var fc      = 5,
                defer   = Q.defer(),
                pdu     = that.pduWithTwoParameter(fc, address, value?0xff00:0x0000);

            if (!cb) {

                that.makeRequest(fc, pdu, that.promiseCallback(defer));
                return defer.promise;
            
            }

            return that.makeRequest(fc, pdu, cb);

        },

        writeSingleRegister: function (address, value, cb) {
            var fc      = 6,
                defer   = Q.defer(),
                pdu     = that.pduWithTwoParameter(fc, address, value);

            if (!cb) {

                that.makeRequest(fc, pdu, that.promiseCallback(defer));
                return defer.promise;
            
            }

            return that.makeRequest(fc, pdu, cb);
        
        },

        writeMultipleCoils: function (startAddress, coils, cb) {
       
            if (coils.length > 1968) {
            
                cb({}, true);
                return;

            }

            var fc          = 15,
                byteCount   = Math.ceil(coils.length / 8) + (coils.length % 8 > 0?1:0),
                curByte     = 0,
                cntr        = 0, 
                defer       = Q.defer(),
                pdu         = Put()
                    .word8(fc)
                    .word16be(startAddress)
                    .word16be(coils.length)
                    .word8(byteCount);

                for (var i = 0; i < coils.length; i += 1) {

                    curByte += coils[i]?Math.pow(2, cntr):0;

                    cntr = (cntr + 1) % 8;

                    if (cntr === 0) {
                        pdu.word8(curByte);
                    }
                
                }

                pdu.buffer();
                

            if (!cb) {

                that.makeRequest(fc, pdu, that.promiseCallback(defer));
                return defer.promise;
            
            }

            return that.makeRequest(fc, pdu, cb);        
        
        },

        isConnected: function () {

            return that.isConnected;

        },

        on: function (name, cb) {

            socket.on(name, cb);

        },

        flush: function () {
            that.flush();
        },

        close: function () {

            that.socket.end();

        }

    };

    return api;

};

var proto = ModbusClient.prototype;


proto.promiseCallback = function (defer) {

    var that = this;

    return function (resp, err) {
   
        console.log(arguments);

        if (err) {
        
            defer.reject(err);
            return;

        }

        defer.resolve(resp);
    
    };

};

/**
 * Pack up the pdu and the handler function
 * and pipes both. Calls flush in the end.
 */
proto.makeRequest = function (fc, pdu, cb) {

    var req = { 
        fc: fc, 
        cb: cb, 
        pdu: pdu 
    };

    this.pipe.push(req);

    if (this.state === 'ready') {

        this.flush();

    }

};

/**
 *  Iterates through the package pipe and 
 *  sends the requests
 */
proto.flush = function () {

    if (!this.isConnected) {

        return;

    }

    if (this.pipe.length > 0 && !this.current) {

        this.current = this.pipe.shift();

        log('sending data');
        this.socket.write(this.current.pdu);
        this.state = "waiting";

    }

};


/**
 *  Returns the main response handler
 */
proto.handleData = function (that) {

    /**
     *  This is the main response handler. It simply
     *  reads the mbap first and dispatches the 
     *  pdu to the next callback in the pipe (I am not sure
     *  if the requests are handled in sequence but this is 
     *  definitivly a place where errors can occure due to wrong
     *  assigned callbacks, keep that in mind.)
     */
    return function (pdu) {

        if (!that.current) {
            return;
        }

        log('received data');

        // 1. check pdu for errors

        log("Checking pdu for errors");
        if (that.handleErrorPDU(pdu, that.current.cb)) {
            that.state = "ready";
            that.current = null;
            that.flush();
            return;
        }      

        // 2. handle pdu

        log("Calling Callback with pdu.");
        var handler = that.resHandler[that.current.fc];
        if (!handler) { 
            throw "No handler implemented.";
        }
        handler(pdu, that.current.cb);

        that.current = null;
        that.state = "ready";
        that.flush();

    };

};

/**
 *  Check if the given pdu contains fc > 0x84 (error code)
 *  and return false if not, otherwise handle the error,
 *  call cb(null, err) and return true
 */
proto.handleErrorPDU = function (pdu, cb) {

    var errorCode = pdu.readUInt8(0);

    // if error code is smaller than 0x80
    // the pdu describes no error
    if (errorCode < 0x80) {
        return false;
    }

    log("PDU describes an error.");
    var exceptionCode = pdu.readUInt8(1);
    var message = Handler.ExceptionMessage[exceptionCode];

    var err = { 
        errorCode: errorCode, 
        exceptionCode: exceptionCode, 
        message: message
    };

    // call the desired callback with
    // err parameter set
    cb(null, err);

    return true; 
};

/**
 *  Many requests look like this so I made
 *  this an extra function.
 */
proto.pduWithTwoParameter = function (fc, start, quantity) {

    return Put()
        .word8(fc)
        .word16be(start)
        .word16be(quantity)
        .buffer();

};

proto.handleClose = function (that) {

    return function () {

        that.isConnected = false;

    };

};

proto.handleEnd = function (that) {

    return function () {

        that.isConnected = false;

    };

};

exports.create = ModbusClient;


