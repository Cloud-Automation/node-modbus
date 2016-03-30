var stampit     = require('stampit'),
    Put         = require('put');


module.exports = stampit()
    .init(function () {
    
        var init = function () {
       
            this.log.debug('initiating write single register request handler.');

            if (!this.responseDelay) {
                this.responseDelay = 0;
            }

            this.setRequestHandler(6, onRequest);
        
        }.bind(this);
    
        var onRequest = function (pdu, cb) {

            setTimeout(function () {

                this.log.debug('handling write single register request.');

                if (pdu.length !== 5) {
                
                    cb(Put().word8(0x86).word8(0x02).buffer());
                    return;

                }

                var fc          = pdu.readUInt8(0),
                    address     = pdu.readUInt16BE(1),
                    byteAddress = address * 2,
                    value       = pdu.readUInt16BE(3);

                this.emit('preWriteSingleRegisterRequest', byteAddress, value);

                var mem = this.getHolding();

                if (byteAddress > mem.length) {
                
                    cb(Put().word8(0x86).word8(0x02).buffer());
                    return;

                }

                var response = Put().word8(0x06).word16be(address).word16be(value).buffer();

                mem.writeUInt16BE(value, byteAddress); 

                this.emit('postWriteSingleRegisterRequest', byteAddress, value);

                cb(response);

            }.bind(this), this.responseDelay);
        
        }.bind(this);
    

        init();
    
    });
