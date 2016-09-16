var stampit = require('stampit'),
    Q       = require('q'),
    Put     = require('put');


module.exports = stampit()
    .init(function () {
    
        var init = function () {
        
            this.addResponseHandler(15, onResponse);
        
        }.bind(this);
    
        var onResponse = function (pdu, request) {
 
            this.log.debug("handling multiple coils response.");

            var fc              = pdu.readUInt8(0),
                startAddress    = pdu.readUInt16BE(1),
                quantity        = pdu.readUInt16BE(3);
    
            var resp = {
                fc              : fc,
                startAddress    : startAddress,
                quantity        : quantity
            };

            if (fc !== 15) {
                request.defer.reject();
                return;
            }

            request.defer.resolve(resp);

       
        }.bind(this);

        this.writeMultipleCoils = function (startAddress, coils, N) {
 
            var defer = Q.defer();
            var fc          = 15,
                pdu         = Put()
                                .word8(fc)
                                .word16be(startAddress)

            if (coils instanceof Buffer) {

              pdu.word16be(N)
                 .word8(coils.length)
                 .put(coils)
            } else if (coils instanceof Array) {

              if (coils.length > 1968) {
                defer.reject();
                return;
              }

              var byteCount   = Math.ceil(coils.length / 8),
                  curByte     = 0,
                  cntr        = 0

              pdu.word16be(coils.length)
                 .word8(byteCount);

              for (var i = 0; i < coils.length; i += 1) {

                  curByte += coils[i]?Math.pow(2, cntr):0;

                  cntr = (cntr + 1) % 8;

                  if (cntr === 0 || i === coils.length - 1 ) {
                      pdu.word8(curByte)
                      curByte = 0
                  }
              }
            }

            pdu = pdu.buffer();
            
            this.queueRequest(fc, pdu, defer);

            return defer.promise;

        };

        init();
    
    });
