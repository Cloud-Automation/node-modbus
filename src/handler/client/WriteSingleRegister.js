var Stampit = require('stampit'),
    Q       = require('q'),
    Put     = require('put');


module.exports = Stampit()
    .init(function () {
    
        var init = function () {
        
            this.addResponseHandler(6, onResponse);
        
        }.bind(this);
    
        var onResponse = function (pdu, request) {
 
            this.log.debug("handling write single register response.");

            var fc              = pdu.readUInt8(0),
        		registerAddress = pdu.readUInt16BE(1),
		        registerValue   = pdu.readUInt16BE(3);

            var resp = {
                fc              : fc,
                registerAddress : registerAddress,
                registerValue   : registerValue
            };

            if (fc !== 6) {
                request.defer.reject();
                return;
            }

            request.defer.resolve(resp);
       
        }.bind(this);

        this.writeSingleRegister = function (address, value) {
 
            var fc      = 6,
                defer   = Q.defer(),
                pdu     = Put().word8be(6).word16be(address).word16be(value).buffer();

            this.queueRequest(fc, pdu, defer);

            return defer.promise;
        
        };

        init();
    
    });
