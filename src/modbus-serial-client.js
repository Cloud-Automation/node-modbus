var stampit         = require('stampit'),
    Put             = require('put'),
    ModbusCore      = require('./modbus-client-core.js');

var crc16modbus = require('crc').crc16modbus;

module.exports = stampit()
    .compose(ModbusCore)
    .init(function () {
    
    
        var SerialPort = require('serialport').SerialPort,
            serialport;

        var init = function () {
        
            this.setState('init');

            if (!this.portName) { throw new Error('No portname.' );}
            if (!this.baudRate) { this.baudRate = 115200; }
            
            serialport = new SerialPort(this.portName, {
                baudRate : this.baudrate,
                parity : 'none'
            });

            serialport.on('open', onOpen);
            serialport.on('close', onClose);
            serialport.on('data', onData);
            serialport.on('error', onError);

            this.on('send', onSend);
        
        }.bind(this);
    
        var onOpen = function () {

            this.emit('connect');
            this.setState('ready');

        }.bind(this);

        var onClose = function () {
       
           this.setState('closed'); 
        
        }.bind(this);

        var onData = function (pdu) {
        
            this.log.debug('received data');
            // Compared to ModBus TCP, ModBus RTU adds the device address which we need to remove
            this.emit('data', pdu.slice(1));
        
        }.bind(this);

        var onError = function (err) {

            this.emit('error', err); 
        
        }.bind(this);
    
        var onSend = function (pdu) {

            // TODO: slave address is now hard-coded to 1
            var pkt = Put()
                .word8(1)
                .put(pdu),
                buf = pkt.buffer();

            var crc = crc16modbus(buf);

            // Add CRC in little-endian mode (least significant byte first)
            pkt = pkt.word16le(crc).buffer();

            for (var j = 0; j < pkt.length; j += 1) {
                console.log(pkt.readUInt8(j).toString(16));
            }
 
            serialport.write(pkt, function (err) {
            
                if (err) {
                    this.emit('error', err);
                    return;
                }
            
            }.bind(this));
        
        }.bind(this);

        this.close = function () {
        
            serialport.close();
        
        };

        init();
    
    
    });
