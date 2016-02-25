var stampit     = require('stampit'),
    Put         = require('put');


module.exports = stampit()
    .init(function () {
    
        var init = function () {
       
            this.log('initiating write single register request handler.');

            if (!this.responseDelay) {
                this.responseDelay = 0;
            }

            this.setRequestHandler(6, onRequest);
        
        }.bind(this);
    
        var onRequest = function (pdu, cb) {

            setTimeout(function () {

                this.log('handling write single register request.');

                if (pdu.length !== 5) {
                
                    cb(Put().word8(0x86).word8(0x02).buffer());
                    return;

                }

                var fc          = pdu.readUInt8(0),
                    address     = pdu.readUInt16BE(1),
                    value       = pdu.readUInt16BE(3);

                this.emit('preWriteSingleRegisterRequest', address, value);

                var mem = this.getHolding();

                if (address > mem.length) {
                
                    cb(Put().word8(0x86).word8(0x02).buffer());
                    return;

                }

                var response = Put().word8(0x06).word16be(address).word16be(value).buffer();

                mem.writeUInt16BE(value); 

                this.emit('postWriteSingleRegisterRequest', address, value);

                cb(response);

            }.bind(this), this.responseDelay);
        
        }.bind(this);
    

        init();
    
    });
