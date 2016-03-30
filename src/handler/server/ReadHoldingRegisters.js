var stampit     = require('stampit'),
    Put         = require('put');


module.exports = stampit()
    .init(function () {
    
        var init = function () {
       
            this.log.debug('initiating read holding registers request handler.');

            if (!this.responseDelay) {
                this.responseDelay = 0;
            }

            this.setRequestHandler(3, onRequest);
        
        }.bind(this);
    
        var onRequest = function (pdu, cb) {

            setTimeout(function () {

                this.log.debug('handling read holding registers request.');

                if (pdu.length !== 5) {

                    this.log.debug('wrong pdu length.');

                    cb(Put().word8(0x83).word8(0x02).buffer());
                    return;

                }

                var fc          = pdu.readUInt8(0),
                    start       = pdu.readUInt16BE(1),
                    byteStart   = start * 2,
                    quantity    = pdu.readUInt16BE(3);

                this.emit('readHoldingRegistersRequest', byteStart, quantity);

                var mem = this.getHolding();

                if (byteStart > mem.length || byteStart + (quantity * 2) > mem.length) {

                    this.log.debug('request outside register boundaries.');                
                    cb(Put().word8(0x83).word8(0x02).buffer());
                    return;

                }

                var response = Put().word8(0x03).word8(quantity * 2);

                for (var i = byteStart; i < byteStart + (quantity * 2); i += 2) {
         
                    response.word16be(mem.readUInt16BE(i));

                }

                this.log.debug('finished read holding register request.');

                cb(response.buffer());

            }.bind(this), this.responseDelay);
        
        }.bind(this);
    

        init();
    
    });
