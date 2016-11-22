var Stampit = require('stampit'),
    Promise = require('bluebird')

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
                registerValue   : registerValue,
                registerAddressRaw: pdu.slice(1,3),
                registerValueRaw: pdu.slice(3,5)
            };

            if (fc !== 6) {
                request.defer.reject();
                return;
            }

            request.defer.resolve(resp);
       
        }.bind(this);

        this.writeSingleRegister = function (address, value) {
 
            var fc      = 6,
                defer   = Promise.defer(),
                payload = (value instanceof Buffer) ? value.readUInt16BE(0) : value,
                pdu     = Buffer.allocUnsafe(5)

            pdu.writeUInt8(fc, 0)
            pdu.writeUInt16BE(address, 1)
            pdu.writeUInt16BE(payload, 3)

            this.queueRequest(fc, pdu, defer);

            return defer.promise;
        
        };

        init();
    
    });
