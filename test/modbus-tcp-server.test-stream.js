var assert          = require('assert'),
    stampit         = require('stampit'),
    util            = require('util'),
    eventEmitter    = require('events').EventEmitter;

process.env.DEBUG = true;

describe("Test stream processing for Modbus TCP Server", function () {
    var modbus = require(__dirname + '/../src/modbus');

    var server = new modbus.server.tcp.complete({
            logEnabled:     true,
            logLevel:       'debug',
            port:           9999,
            responseDelay:  100,
            coils:          new Buffer(10000),
            holding :       new Buffer(10000)
        });
    var client;

    describe('Client connect', function () {

        client = new modbus.client.tcp.complete({
            host:         'localhost',
            port:         9999,
            logEnabled:   true,
            logLevel:     'debug',
            logTimestamp: true
        });

        it('Client should inform about connection', function (done) {

            client.on('connect', function () {
                done();
            });
            client.connect();
        });

        var data = server.getCoils();

        data.writeUInt16BE(0xAAAA, 0); // 101010....

        it('should get the coils with normal sender', function (done) {
            client.readCoils(0, 16).then(function (resp) {
                assert.equal(resp.payload[0], 0xAA);
                assert.equal(resp.payload[1], 0xAA);

                done();
            });
        });
        it('should get the coils with modified sender', function (done) {
            // modify client code
            var onSendDelayed = function (pdu) {

                this.log.debug('Sending pdu to the socket.');

                var head = Buffer.allocUnsafe(7);

                head.writeUInt16BE(10, 0);
                head.writeUInt16BE(0, 2); // protocol version
                head.writeUInt16BE(pdu.length + 1, 4);
                head.writeUInt8(1, 6); // unitID

                //var pkt = Buffer.concat([head, pdu]);

                this.setCurrentRequestId(10);

                // first send only header
                this.getSocket().write(head);
                setTimeout(function () {
                    // and then pdu
                    this.getSocket().write(pdu);
                }.bind(this), 200);
            };
            client.registerOnSend(onSendDelayed);

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

        it('should timeout a read holding registers request.', function (done) {
            server.on('close', function () {
                server.close();
                done();
            });
            client.close();
        });
    });

    describe('Negative test', function () {
        var badServer;
        var badClient;

        it('Client should inform about connection', function (done) {
            badServer = new modbus.server.tcp.complete({
                logEnabled:     true,
                logLevel:       'debug',
                port:           10001,
                responseDelay:  100,
                coils:          new Buffer(10000),
                holding :       new Buffer(10000)
            });
            badClient = new modbus.client.tcp.complete({
                host:         'localhost',
                port:         10001,
                logEnabled:   true,
                logLevel:     'debug',
                logTimestamp: true
            });
            badClient.on('connect', function () {
                done();
            });
            badClient.connect();
        });

        it('should get the coils with modified sender', function (done) {
          this.timeout(5500);
            var data = badServer.getCoils();

            data.writeUInt16BE(0xCCCC, 0); // 11001100....
            var reqId = 1;
            // modify client code
            var onSendInvalid = function (pdu) {

                this.log.debug('Sending pdu to the socket.');

                reqId += 1;

                var head = Buffer.allocUnsafe(7);

                head.writeUInt16BE(reqId, 0);
                head.writeUInt16BE(0, 2); // protocol version
                head.writeUInt16BE(pdu.length + 1, 4);
                head.writeUInt8(1, 6); // unitID

                //var pkt = Buffer.concat([head, pdu]);

                this.setCurrentRequestId(reqId);

                // first send only header
                this.getSocket().write(head);
                setTimeout(function () {
                    // and then pdu
                    //this.getSocket().write(pdu);
                }.bind(this), 200);
            };
            badClient.registerOnSend(onSendInvalid);

            badClient.readCoils(0, 16).then(function (resp) {
                assert.equal(resp, null);
            }, function (error) {
                assert.equal(error.err, 'timeout');
                done();
            });
        });
    });
});
