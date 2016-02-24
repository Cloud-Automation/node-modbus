var stampit         = require('stampit'),
    modbus          = require('../..');

var server = stampit()
    .refs({ 'logEnabled' : true, 'port' : 8888, 'responseDelay' : 100 })
    .compose(modbus.server.tcp.complete)
    .init(function () {
    
        var init = function () {

            this.getCoils().writeUInt8(0);

            this.on('readCoilsRequest', function (start, quantity) {
           
                var oldValue = this.getCoils().readUInt8(start);

                oldValue = (oldValue + 1) % 255;

                this.getCoils().writeUInt8(oldValue, start);

            });
            
            this.getHolding().writeUInt16BE(1, 0); 
            this.getHolding().writeUInt16BE(2, 2); 
            this.getHolding().writeUInt16BE(3, 4); 
            this.getHolding().writeUInt16BE(4, 6); 
            this.getHolding().writeUInt16BE(5, 8); 
            this.getHolding().writeUInt16BE(6, 10); 
            this.getHolding().writeUInt16BE(7, 12); 
            this.getHolding().writeUInt16BE(8, 14); 

       
        }.bind(this);
    
    
        init();
    
    });

server();
