var assert          = require('assert'),
    stampit         = require('stampit'),
    util            = require('util'),
    eventEmitter    = require('events').EventEmitter;

process.env.DEBUG = true;

describe("Test stream processing for Modbus TCP client", function () {
    var modbus = require(__dirname + '/../src/modbus');

    describe('Client receive test', function () {
        var server = new modbus.server.tcp.complete({
            logEnabled:     true,
            logLevel:       'debug',
            port:           10002,
            responseDelay:  100,
            coils:          new Buffer(10000),
            holding:        new Buffer(10000)
        });
        var client;
        var data = server.getCoils();

        data.writeUInt16BE(0xAAAA, 0); // 101010....

        it('should get the coils with modified sender', function (done) {

            var buffer = new Buffer(0);
            var onSocketData = function (socket, socketId) {

                return function (data) {

                    this.log.debug('received data socket', socketId, data.byteLength);

                    buffer = Buffer.concat([buffer, data]);

                    while (buffer.length > 8) {

                        // 1. extract mbap

                        var len = buffer.readUInt16BE(4);
                        var request = {
                            trans_id: buffer.readUInt16BE(0),
                            protocol_ver: buffer.readUInt16BE(2),
                            unit_id: buffer.readUInt8(6)
                        };

                        // 2. extract pdu

                          /* arrived data is not complete yet.
                           * break loop and wait for more data. */

                        if (buffer.length < 7 + len - 1) {
                            break;
                        }

                        var pdu = buffer.slice(7, 7 + len - 1);

                        // emit data event and let the
                        // listener handle the pdu

                        this.log.debug('PDU extracted.');

                        server.getQueue().push({ request : request, pdu : pdu, socket : socket });

                        flush();

                        buffer = buffer.slice(pdu.length + 7, buffer.length);

                    }

                }.bind(this);

            }.bind(server);

            var flush = function () {

                if (this.inState('processing')) {
                    return;
                }

                var fifo = server.getQueue();

                if (fifo.length === 0) {
                    return;
                }

                this.setState('processing');

                var current = fifo.shift();

                this.onData(current.pdu, function (response) {

                    this.log.debug('sending tcp data');

                    var head = Buffer.allocUnsafe(7);

                    head.writeUInt16BE(current.request.trans_id, 0);
                    head.writeUInt16BE(current.request.protocol_ver, 2);
                    head.writeUInt16BE(response.length + 1, 4);
                    head.writeUInt8(current.request.unit_id, 6);

                    //var pkt = Buffer.concat([head, response]);

                    current.socket.write(head);
                    setTimeout(function () {
                        current.socket.write(response);
                    }, 300);

                    this.setState('ready');

                }.bind(this));

            }.bind(server);

            server.registerOnData(onSocketData);

            client = new modbus.client.tcp.complete({
                host:         'localhost',
                port:         10002,
                logEnabled:   true,
                logLevel:     'debug',
                logTimestamp: true
            });

            client.on('connect', function () {
                client.readCoils(0, 16).then(function (resp) {
                    assert.equal(resp.payload[0], 0xAA);
                    assert.equal(resp.payload[1], 0xAA);

                    // test one more time
                    data.writeUInt16BE(0x5555, 0); // 0101010....
                    client.readCoils(0, 16).then(function (resp) {
                        assert.equal(resp.payload[0], 0x55);
                        assert.equal(resp.payload[1], 0x55);
                        done();
                    });
                });
            });
            client.connect();
        });

        it('should timeout a read holding registers request.', function (done) {
            server.on('close', function () {
                server.close();
                done();
            });
            client.close();
        });
    });

    describe('Negative client receive test', function () {
        var server = new modbus.server.tcp.complete({
            logEnabled:     true,
            logLevel:       'debug',
            port:           10003,
            responseDelay:  100,
            coils:          new Buffer(10000),
            holding:        new Buffer(10000)
        });
        var client;
        var data = server.getCoils();

        data.writeUInt16BE(0xAAAA, 0); // 101010....

        it('should timeout with modified sender', function (done) {
            this.timeout(5500);
            var buffer = new Buffer(0);
            var onSocketData = function (socket, socketId) {

                return function (data) {

                    this.log.debug('received data socket', socketId, data.byteLength);

                    buffer = Buffer.concat([buffer, data]);

                    while (buffer.length > 8) {

                        // 1. extract mbap

                        var len = buffer.readUInt16BE(4);
                        var request = {
                            trans_id: buffer.readUInt16BE(0),
                            protocol_ver: buffer.readUInt16BE(2),
                            unit_id: buffer.readUInt8(6)
                        };

                        // 2. extract pdu

                        /* arrived data is not complete yet.
                         * break loop and wait for more data. */

                        if (buffer.length < 7 + len - 1) {
                            break;
                        }

                        var pdu = buffer.slice(7, 7 + len - 1);

                        // emit data event and let the
                        // listener handle the pdu

                        this.log.debug('PDU extracted.');

                        server.getQueue().push({ request : request, pdu : pdu, socket : socket });

                        flush();

                        buffer = buffer.slice(pdu.length + 7, buffer.length);

                    }

                }.bind(this);

            }.bind(server);

            var flush = function () {

                if (this.inState('processing')) {
                    return;
                }

                var fifo = server.getQueue();

                if (fifo.length === 0) {
                    return;
                }

                this.setState('processing');

                var current = fifo.shift();

                this.onData(current.pdu, function (response) {

                    this.log.debug('sending tcp data');

                    var head = Buffer.allocUnsafe(7);

                    head.writeUInt16BE(current.request.trans_id, 0);
                    head.writeUInt16BE(current.request.protocol_ver, 2);
                    head.writeUInt16BE(response.length + 1, 4);
                    head.writeUInt8(current.request.unit_id, 6);

                    //var pkt = Buffer.concat([head, response]);

                    current.socket.write(head);
                    setTimeout(function () {
                        //current.socket.write(response);
                    }, 300);

                    this.setState('ready');

                }.bind(this));

            }.bind(server);

            server.registerOnData(onSocketData);

            client = new modbus.client.tcp.complete({
                host:         'localhost',
                port:         10003,
                logEnabled:   true,
                logLevel:     'debug',
                logTimestamp: true
            });

            client.on('connect', function () {
                client.readCoils(0, 16).then(function (resp) {
                    assert.equal(resp, null);
                }, function (error) {
                    assert.equal(error.err, 'timeout');
                    done();
                });
            });
            client.connect();
        });
    });

});
