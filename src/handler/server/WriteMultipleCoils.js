var stampit     = require('stampit'),
    Put         = require('put');


module.exports = stampit()
    .init(function () {
    
        var init = function () {
       
            this.log.debug('initiating write multiple coils request handler.');

            if (!this.responseDelay) {
                this.responseDelay = 0;
            }

            this.setRequestHandler(15, onRequest);
        
        }.bind(this);
    
        var onRequest = function (pdu, cb) {

            setTimeout(function () {

                this.log.debug('handling write multiple coils request.');

                if (pdu.length < 3) {
                
                    cb(Put().word8(0x8F).word8(0x02).buffer());
                    return;

                }

                var fc          = pdu.readUInt8(0),
                    start       = pdu.readUInt16BE(1),
                    quantity    = pdu.readUInt16BE(3),
                    byteCount   = pdu.readUInt8(5);

                this.emit('preWriteMultipleCoilsRequest', start, quantity, byteCount);

                var mem = this.getCoils();

                if (start > mem.length * 8 || start + quantity > mem.length * 8) {
                
                    cb(Put().word8(0x8F).word8(0x02).buffer());
                    return;

                }

                var response = Put().word8(0x0F).word16be(start).word16be(quantity).buffer(),
                    oldValue, newValue, current = pdu.readUInt8(6 + 0), j = 0;

                for (var i = start; i < start + quantity; i += 1 ) {

                    oldValue = mem.readUInt8(Math.floor(i / 8));
                  
                    if (Math.pow(2, j % 8) & current) {
                        newValue = oldValue | Math.pow(2, i % 8);
                    } else {
                        newValue = oldValue & ~Math.pow(2, i % 8); 
                    }

                    mem.writeUInt8(newValue, Math.floor(start / 8)); 

                    j += 1;

                    if (j % 8 === 0) {
                    
                        current = pdu.readUInt8(6 +  Math.floor(j / 8));
                    
                    }

                }

                this.emit('postWriteMultipleCoilsRequest', start, quantity, byteCount);

                cb(response);

            }.bind(this), this.responseDelay);
        
        }.bind(this);
    

        init();
    
    });
