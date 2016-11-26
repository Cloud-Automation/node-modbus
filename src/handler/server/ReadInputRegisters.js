var stampit     = require('stampit'),
    Put         = require('put');


module.exports = stampit()
    .init(function () {
    
        var init = function () {
       
            this.log.debug('initiating read input registers request handler.');

            if (!this.responseDelay) {
                this.responseDelay = 0;
            }

            this.setRequestHandler(4, onRequest);
        
        }.bind(this);
    
        var onRequest = function (pdu, cb) {

            setTimeout(function () {

                this.log.debug('handling read input registers request.');

                if (pdu.length !== 5) {
                
                    cb(Put().word8(0x84).word8(0x02).buffer());
                    return;

                }

                var fc          = pdu.readUInt8(0),
                    start       = pdu.readUInt16BE(1),
                    byteStart   = start * 2,
                    quantity    = pdu.readUInt16BE(3);

                this.emit('readInputRegistersRequest', byteStart, quantity);

                var mem = this.getInput();

                if (byteStart > mem.length || byteStart + (quantity * 2) > mem.length) {
                
                    cb(Put().word8(0x84).word8(0x02).buffer());
                    return;

                }

                var response = Put().word8(0x04).word8(quantity * 2);

                for (var i = byteStart; i < byteStart + (quantity * 2); i += 2) {
         
                    response.word16be(mem.readUInt16BE(i));

                }

                cb(response.buffer());

            }.bind(this), this.responseDelay);
        
        }.bind(this);
    

        init();
    
    });
