var Stampit = require('stampit'),
    Q       = require('q'),
    Put     = require('put');


module.exports = Stampit()
    .init(function () {
    
        var init = function () {
        
            this.addResponseHandler(3, onResponse);
        
        }.bind(this);
    
        var onResponse = function (pdu, request) {
 
            this.log.debug("handling read holding registers response.");

            var fc          = pdu.readUInt8(0),
                byteCount   = pdu.readUInt8(1);

            var resp = {
                fc          : fc,
                byteCount   : byteCount,
                register    : [ ]
            };

            if (fc !== 3) {
                request.defer.reject();
                return;
            }

            var registerCount = byteCount / 2;

            for (var i = 0; i < registerCount; i += 1) {
                resp.register.push(pdu.readUInt16BE(2 + (i * 2)));
            }

            request.defer.resolve(resp);
 
       
        }.bind(this);

        this.readHoldingRegisters = function (start, quantity) {
      
           this.log.debug('Starting read holding registers request.'); 

            var fc      = 3,
                defer   = Q.defer(),
                pdu     = Put().word8be(3).word16be(start).word16be(quantity).buffer();

            this.queueRequest(fc, pdu, defer);

            return defer.promise;

        };

        init();
    
    });
