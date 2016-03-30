var Stampit = require('stampit'),
    Q       = require('q'),
    Put     = require('put');


module.exports = Stampit()
    .init(function () {
    
        var init = function () {
        
            this.addResponseHandler(1, onResponse);
        
        }.bind(this);
    
        var onResponse = function (pdu, request) {
 
            this.log.debug("handeling read coils response.");

            var fc          = pdu.readUInt8(0),
                byteCount   = pdu.readUInt8(1),
                bitCount    = byteCount * 8;

            var resp = {
                    fc          : fc,
                    byteCount   : byteCount,
                    coils       : [] 
                };

            if (fc !== 1) {
                request.defer.reject();
                return;
            }

            var cntr = 0;
            for (var i = 0; i < byteCount; i+=1) {
                var h = 1, cur = pdu.readUInt8(2 + i);
                for (var j = 0; j < 8; j+=1) {
                    resp.coils[cntr] = (cur & h) > 0 ;
                    h = h << 1;
                    cntr += 1;
                } 
            }

            request.defer.resolve(resp);
       
        
        }.bind(this);

        this.readCoils = function (start, quantity) {
 
            var fc      = 1,
                defer   = Q.defer(),
                pdu     = Put().word8(fc).word16be(start).word16be(quantity).buffer();

            this.queueRequest(fc, pdu, defer);
            
            return defer.promise;
             
        };

        init();
    
    });
