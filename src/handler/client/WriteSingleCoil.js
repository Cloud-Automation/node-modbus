var Stampit = require('stampit'),
    Q       = require('q'),
    Put     = require('put');

module.exports = Stampit()
    .init(function () {
    
        var init = function () {
        
            this.addResponseHandler(5, onResponse);
        
        }.bind(this);

        var onResponse = function (pdu, request) {
        
            this.log.debug("handling write single coil response.");

            var fc              = pdu.readUInt8(0),
                outputAddress   = pdu.readUInt16BE(1),
                outputValue     = pdu.readUInt16BE(3);

            var resp = {
                fc              : fc,
                outputAddress   : outputAddress,
                outputValue     : outputValue === 0x0000?false:outputValue===0xFF00?true:undefined
            };

            if (fc !== 5) {
                request.defer.reject();
                return;
            }

            request.defer.resolve(resp);
       
        }.bind(this);

        this.writeSingleCoil = function (address, value) {
 
            var fc      = 5,
                defer   = Q.defer(), 
                pdu     = Put().word8be(5).word16be(address).word16be(value?0xff00:0x0000).buffer();

            this.queueRequest(fc, pdu, defer);

            return defer.promise;
        
        };
    
    

        init();
    
    });
