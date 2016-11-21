var stampit     = require('stampit')

module.exports = stampit()
    .init(function () {
    
        var init = function () {
       
            this.log.debug('initiating read input registers request handler.');

            if (!this.responseDelay) {
                this.responseDelay = 0;
            }

            this.setRequestHandler(4, onRequest);
        
        }.bind(this);
    
        var onRequest = function (pdu, cb) {

            setTimeout(function () {

                this.log.debug('handling read input registers request.');

                if (pdu.length !== 5) {
                
                    var buf = Buffer.allocUnsafe(2);
  
                    buf.writeUInt8(0x84, 0);
                    buf.writeUInt8(0x02, 1);
                    cb(buf);
                    return;
                }

                var //fc          = pdu.readUInt8(0), //unused
                    start       = pdu.readUInt16BE(1),
                    byteStart   = start * 2,
                    quantity    = pdu.readUInt16BE(3);

                this.emit('readInputRegistersRequest', byteStart, quantity);

                var mem = this.getInput();

                if (byteStart > mem.length || byteStart + (quantity * 2) > mem.length) {
                
                  var buf = Buffer.allocUnsafe(2);

                  buf.writeUInt8(0x84, 0);
                  buf.writeUInt8(0x02, 1);
                  cb(buf);
                  return;
                }

                var head = Buffer.allocUnsafe(2);
                 
                head.writeUInt8(0x04, 0);
                head.writeUInt8(quantity * 2, 1);

                var response = Buffer.concat([head, mem.slice(byteStart * 2, byteStart * 2 + quantity * 2)]);


                cb(response);

            }.bind(this), this.responseDelay);
        
        }.bind(this);
    

        init();
    
    });
