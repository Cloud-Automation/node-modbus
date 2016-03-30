var Stampit = require('stampit'),
    Q       = require('q'),
    Put     = require('put');


module.exports = Stampit()
    .init(function () {
    
        var init = function () {
        
            this.addResponseHandler(2, onResponse);
        
        }.bind(this);
    
        var onResponse = function (pdu, request) {
 
            this.log.debug("handeling read discrete inputs response.");

            var fc          = pdu.readUInt8(0),
                byteCount   = pdu.readUInt8(1),
                cntr        = 0,
                resp        = {
                    fc          : fc,
                    byteCount   : byteCount,
                    coils       : []
                };

            if (fc !== 2) {
                request.defer.reject();
                return;
            }

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

        this.readDiscreteInputs = function (start, quantity) {
 
            var fc      = 2,
                defer   = Q.defer(),
                pdu     = Put().word8be(2).word16be(start).word16be(quantity).buffer();

            if (quantity > 2000) {    

                defer.reject(); 
         
                return defer.promise; 
                

            }

            this.queueRequest(fc, pdu, defer);
            
            return defer.promise;
             
        };

        init();
    
    });
