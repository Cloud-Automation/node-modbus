var Stampit = require('stampit'),
    Promise = require('bluebird')

module.exports = Stampit()
    .init(function () {
    
        var init = function () {
        
            this.addResponseHandler(2, onResponse);
        
        }.bind(this);
    
        var onResponse = function (pdu, request) {
 
            this.log.debug("handling read discrete inputs response.");

            var fc          = pdu.readUInt8(0),
                byteCount   = pdu.readUInt8(1),
                cntr        = 0,
                resp        = {
                    fc          : fc,
                    byteCount   : byteCount,
                    payload     : pdu.slice(2),
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
                defer   = Promise.defer(),
                pdu     = Buffer.allocUnsafe(5)

            pdu.writeUInt8(fc)
            pdu.writeUInt16BE(start,1)
            pdu.writeUInt16BE(quantity,3)

            if (quantity > 2000) {    

                defer.reject(); 
                return defer.promise; 
            }

            this.queueRequest(fc, pdu, defer);
            
            return defer.promise;
             
        };

        init();
    
    });
