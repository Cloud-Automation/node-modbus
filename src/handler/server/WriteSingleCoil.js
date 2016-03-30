var stampit     = require('stampit'),
    Put         = require('put');


module.exports = stampit()
    .init(function () {
    
        var init = function () {
       
            this.log.debug('initiating write single coil request handler.');

            if (!this.responseDelay) {
                this.responseDelay = 0;
            }

            this.setRequestHandler(5, onRequest);
        
        }.bind(this);
    
        var onRequest = function (pdu, cb) {

            setTimeout(function () {

                this.log.debug('handling write single coil request.');

                if (pdu.length !== 5) {
                
                    cb(Put().word8(0x85).word8(0x02).buffer());
                    return;

                }

                var fc          = pdu.readUInt8(0),
                    address     = pdu.readUInt16BE(1),
                    value       = pdu.readUInt16BE(3) === 0x0000?false:true;

                if (pdu.readUInt16BE(3) !== 0x0000 && pdu.readUInt16BE(3) !== 0xFF00) {
                
                    cb(Put().word8(0x85).word8(0x03).buffer());
                    return; 
                 
                }

                this.emit('preWriteSingleCoilRequest', address, value);

                var mem = this.getCoils();

                if (address > mem.length * 8) {
                
                    cb(Put().word8(0x85).word8(0x02).buffer());
                    return;

                }

                var response = Put().word8(0x05).word16be(address).word16be(value?0xFF00:0x0000),
                    oldValue = mem.readUInt8(Math.floor(address / 8)),
                    newValue;
                  
                if (value) {
                    newValue = oldValue | Math.pow(2, address % 8);
                } else {
                    newValue = oldValue & ~Math.pow(2, address % 8); 
                }

                mem.writeUInt8(newValue, Math.floor(address / 8)); 

                this.emit('postWriteSingleCoilRequest', address, value);

                cb(response.buffer());

            }.bind(this), this.responseDelay);
        
        }.bind(this);
    

        init();
    
    });
