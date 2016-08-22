"use strict";

var stampit = require('stampit'),
    Put = require('put'),
    ModbusCore = require('./modbus-client-core.js');

module.exports = stampit()
    .compose(ModbusCore)
    .init(function () {

        var SerialPort = require('serialport').SerialPort,
            serialport;

        var onOpen = function () {

            this.emit('connect');
            this.setState('ready');

        }.bind(this);

        var onClose = function () {

            this.setState('closed');

        }.bind(this);

        var onData = function (pdu) {

            this.log.debug('received data');

            this.emit('data', pdu);

        }.bind(this);

        var onError = function (err) {

            this.emit('error', err);

        }.bind(this);

        var onSend = function (pdu) {

            var pkt = new Put()
                    .word8(1)
                    .put(pdu),
                buf = pkt.buffer(),
                crc = 0;

            for (var i = 0; i < buf.length; i += 1) {
                crc = (buf.readUInt8(i) + crc) % 0xFFFF;
            }

            pkt = pkt.word16be(crc).buffer();

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
                baudRate: this.baudrate,
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

        this.close = function () {

            serialport.close();

        };

        init();

    });
