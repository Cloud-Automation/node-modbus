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
                    thisByteBitCount = 0,
                    response = Put().word8(0x01).word8(Math.floor(quantity / 8) + (quantity % 8 === 0 ? 0 : 1));

                for (var totalBitCount = start; totalBitCount < start + quantity; totalBitCount += 1) {
     
                    var buf = mem.readUInt8(Math.floor(totalBitCount / 8))
                    var mask = 1 << (totalBitCount % 8)

                    if(buf & mask) {
                      val += 1 << (thisByteBitCount % 8)
                    }
               
                    thisByteBitCount += 1;

                    if (thisByteBitCount % 8 === 0 || totalBitCount === (start + quantity) - 1) {
                   
                        response.word8(val);
                        val = 0;
                    }
                }

                cb(response.buffer());

            }.bind(this), this.responseDelay);
            
        }.bind(this);
    

        init();
    
    });
