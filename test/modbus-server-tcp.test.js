var stampit         = require('stampit')
var assert          = require('assert')
var EventEmitter    = require('events')

describe("Modbus Server TCP Tests.", function () {

    describe('Chopped Data Tests.', function () {

        /* We are using the read coils request for the chopped data tests. */

        let ClientSocket = require('../src/modbus-tcp-server-client.js')

        it('should handle a chopped data request fine.', function (done) {

            var em = new EventEmitter()
            var request_1 = Buffer.from([0x00,0x01]) // Transaction Identifier
            var request_2 = Buffer.from([0x00,0x00]) // Protocol
            var request_3 = Buffer.from([0x00,0x05]) // Length
            var request_4 = Buffer.from([0x01]) // Unit identifier
            var request_5 = Buffer.from([0x01]) // PDU Function Code
            var request_6 = Buffer.from([0x00,0x0A]) // Start Address
            var request_7 = Buffer.from([0x00,0x15]) // Quantitiy

            var exRequest = { 
              request : {
                trans_id: 1,
                protocol_ver: 0,
                unit_id: 1
              },
              pdu : Buffer.from([0x01,0x00,0x0A,0x00,0x15]),
              socket : em }

            var callback_counter = 0
            var handler = function (req) {
              assert.deepEqual(req, exRequest);
              callback_counter += 1;
              assert.equal(callback_counter, 1);
              done();
            } 

            var socket = ClientSocket({ 
              socket : em, 
              socketId : 1,
              onRequest : handler 
            })

            em.emit('data', request_1)
            em.emit('data', request_2)
            em.emit('data', request_3)
            em.emit('data', request_4)
            em.emit('data', request_5)
            em.emit('data', request_6)
            em.emit('data', request_7)
              
        });
 
    });


});
