var stampit     = require('stampit'),
    Put         = require('put');


module.exports = stampit()
    .init(function () {
    
        var init = function () {
       
            this.log.debug('initiating read coils request handler.');

            if (!this.responseDelay) {
                this.responseDelay = 0;
            }

            this.setRequestHandler(1, onRequest);
        
        }.bind(this);
    
        var onRequest = function (pdu, cb) {

            setTimeout(function () {

                this.log.debug('handling read coils request.');


                if (pdu.length !== 5) {
                
                    cb(Put().word8(0x81).word8(0x02).buffer());
                    return;

                }

                var fc          = pdu.readUInt8(0),
                    start       = pdu.readUInt16BE(1),
                    quantity    = pdu.readUInt16BE(3);

                this.emit('readCoilsRequest', start, quantity);

                var mem = this.getCoils();

                if (start > mem.length * 8 || start + quantity > mem.length * 8) {
                
                    cb(Put().word8(0x81).word8(0x02).buffer());
                    return;

                }

                var val = 0, 
                    j = 0,
                    response = Put().word8(0x01).word8(Math.floor(quantity / 8) + (quantity % 8 === 0 ? 0 : 1));

                for (var i = start; i < start + quantity; i += 1) {
     
                    val += mem.readUInt8(Math.floor(i / 8)) &  Math.pow(2, i % 8);
               
                    j += 1;

                    if (j % 8 === 0 || i === (start + quantity) - 1) {
                   
                        response.word8(val);
                        val = 0;
                    
                    }


                }

                cb(response.buffer());

            }.bind(this), this.responseDelay);
            
        }.bind(this);
    

        init();
    
    });
