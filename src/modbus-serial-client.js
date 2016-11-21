var stampit         = require('stampit'),
    crc             = require('crc'),
    ModbusCore      = require('./modbus-client-core.js');

module.exports = stampit()
    .compose(ModbusCore)
    .init(function () {
    
    
        var SerialPort = require('serialport'),
            serialport,
            buffer     = new Buffer(0);
    
        var init = function () {

            this.setState('init');

            if (!this.portName) {
                throw new Error('No portname.');
            }

            if (!this.baudRate) {
                this.baudRate = 9600; // the most are working with 9600
            }

            if (!this.dataBits) {
                this.dataBits = 8;
            }

            if (!this.stopBits) {
                this.stopBits = 1;
            }

            if (!this.parity) {
                this.parity = 'none';
            }

            // TODO: flowControl - ['xon', 'xoff', 'xany', 'rtscts']

            // TODO: settings - ['brk', 'cts', 'dtr', 'dts', 'rts']

            serialport = new SerialPort(this.portName, {
                baudRate: this.baudRate,
                parity: this.parity,
                dataBits: this.dataBits,
                stopBits: this.stopBits
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

        var onData = function (data) {
        
            this.log.debug('received data ' + data.length + ' bytes');
            buffer = Buffer.concat([buffer, data]);

            while (buffer.length > 4) {

                // 1. there is no mbap
                // 2. extract pdu

                // 0 - device ID
                // 1 - Function CODE
                // 2 - Bytes length
                // 3.. Data
                // checksum.(2 bytes
                var len;
                var pdu;
                // if response for write
                if (buffer[1] === 5 || buffer[1] === 6 || buffer[1] === 15 || buffer[1] === 16) {
                    if (buffer.length < 8) {
                        break;
                    }
                    pdu = buffer.slice(0, 8);  // 1 byte device ID + 1 byte FC + 2 bytes address + 2 bytes value + 2 bytes CRC
                } else if (buffer[1] > 0 && buffer[1] < 5){
                    len = buffer[2];

                    if (buffer.length < len + 5) {
                        break;
                    }

                    pdu = buffer.slice(0, len + 5); // 1 byte deviceID + 1 byte FC + 1 byte length  + 2 bytes CRC
                } else {
                    // unknown function code
                    this.logError('unknown function code: ' + buffer[1]);
                    // reset buffer and try again
                    buffer = [];
                    break;
                }

                if (crc.crc16modbus(pdu) === 0) { /* PDU is valid if CRC across whole PDU equals 0, else ignore and do nothing */
                    if (pdu[0] !== this.unitId) {
                        // answer for wrong device
                        this.log.debug('received answer for wrong ID ' + buffer[0] + ', expected ' + this.unitId);
                    }
                    // emit data event and let the
                    // listener handle the pdu
                    this.emit('data', pdu.slice(1, pdu.length - 2));
                } else {
                    this.logError('Wrong CRC for frame: ' + toStrArray(pdu));
                    // reset buffer and try again
                    buffer = [];
                    break;
                }
                buffer = buffer.slice(pdu.length, buffer.length);
        
        }.bind(this);

        var onError = function (err) {

            this.emit('error', err); 
        
        }.bind(this);
    
        var onSend = function (pdu) {
            var base = Buffer.allocUnsafe(1);
            base.writeUInt8(this.unitId);
            var buf = Buffer.concat([base, pdu]);

            var crc16 = crc.crc16modbus(buf);

            var crcBuf = Buffer.allocUnsafe(2);
            crcBuf.writeUInt16LE(crc16, 0);

            var pkt = Buffer.concat([buf, crcBuf]);

            serialport.write(pkt, function (err) {
                if (err) {
                    this.emit('error', err);
                }
            }.bind(this));

        }.bind(this);

        this.close = function () {

          serialport.close();

        };

        init();


    });
