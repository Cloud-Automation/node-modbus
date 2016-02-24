var stampit         = require('stampit'),
    Put             = require('put'),
    EventBus        = require('stampit-event-bus'),
    Log             = require('./stampit-log.js');

 var core = stampit()
    .compose(EventBus, Log)
    .init(function () {
   
        var coils, holding, input, handler = { };

        var init = function () {

            if (!this.coils) {
                coils = new Buffer(1024);
            } else {
                coils = this.coils;
            }

            if (!this.holding) {
                holding = new Buffer(1024);
            } else {
                holding = this.holding;
            }

            if (!this.input) {
                input = new Buffer(1024);
            } else {
                input = this.input;
            }

            this.on('data', onData);        
        
        }.bind(this);

        var onData = function (pdu, callback) {

            this.log('receiving pdu');

             // get fc and byteCount in advance
            var fc          = pdu.readUInt8(0),
                byteCount   = pdu.readUInt8(1);

            // get the pdu handler
            var reqHandler  = handler[fc];

            if (!reqHandler) {

                // write a error/exception pkt to the 
                // socket with error code fc + 0x80 and
                // exception code 0x01 (Illegal Function)
          
                this.log('no handler for fc', fc);

                callback(Put().word8(fc + 0x80).word8(0x01).buffer());

                return;
            
            }

            reqHandler(pdu, function (response) {
 
                callback(response);
                   
            }.bind(this));

        
        }.bind(this);

        this.setRequestHandler = function (fc, callback) {
       
            this.log('setting request handler', fc);

            handler[fc] = callback;

            return this;
        
        };

        this.getCoils = function () {
        
            return coils;
        
        };

        this.getInput = function () {
        
            return input;
        
        };

        this.getHolding = function () {
        
            return holding;
        
        };

        init();
    
    });

 module.exports = core;
