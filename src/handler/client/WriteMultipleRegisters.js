var stampit = require('stampit'),
    Promise = require('bluebird'),
    Put     = require('put');


module.exports = stampit()
    .init(function () {
    
        var init = function () {
        
            this.addResponseHandler(16, onResponse);
        
        }.bind(this);
    
        var onResponse = function (pdu, request) {
 
            this.log.debug("handling multiple registers response.");

            var fc              = pdu.readUInt8(0),
                startAddress    = pdu.readUInt16BE(1),
                quantity        = pdu.readUInt16BE(3);
    
            var resp = {
                fc              : fc,
                startAddress    : startAddress,
                quantity        : quantity
            };

            if (fc !== 16) {
                request.defer.reject();
                return;
            }

            request.defer.resolve(resp);

       
        }.bind(this);

        this.writeMultipleRegisters = function (startAddress, register) {
 
            var defer = Promise.defer();
            var fc          = 16,
                pdu         = Put()
                                .word8(fc)
                                .word16be(startAddress)

            if(register instanceof Buffer) {

              if(register.length/2 > 0x007b) {
                defer.reject();
              }

              pdu.word16be(register.length/2)
                 .word8(register.length)
                 .put(register)
            }
            else if(register instanceof Array) {

              if (register.length > 0x007b) {
                  defer.reject();
                  return;
              }

              var byteCount   = Math.ceil(register.length * 2),
                  curByte     = 0

              pdu.word16be(register.length)
                 .word8(byteCount)

              for (var i = 0; i < register.length; i += 1) {
                  pdu.word16be(register[i]);
              }
            } else {
              defer.reject();
            }

            pdu = pdu.buffer();

            this.queueRequest(fc, pdu, defer);

            return defer.promise;
        };

        init();
    
    });
