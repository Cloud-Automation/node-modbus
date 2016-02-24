

var stampit         = require('stampit'),
    assert          = require("assert"),
    Put             = require('put'),
    sinon           = require('sinon'),
    util            = require('util'),
    eventEmitter    = require('events').EventEmitter;

describe("Modbus Serial Client", function () {

    var ModbusClientCore = require('../src/modbus-client-core.js');

    describe('Read Coils Tests.', function () {

        var ReadCoils = require('../src/handler/client/ReadCoils.js'),
            ModbusClient = stampit().compose(ModbusClientCore, ReadCoils);

        it("should read coils just fine.", function (done) {

            var client = ModbusClient();

            client.readCoils(0, 10).then(function (resp) {
       
                assert(resp.fc, 1);
                assert(resp.byteCount, 2);
                assert(resp.coils, [true, false, true, false, true, false, true, false, true]);
            
                done();
        
            }).fail(function () {
            
                assert.ok(false);
            
            }).done();

            client.setState('ready');
            client.emit('data', Put().word8(1).word8be(2).word8be(85).word8be(1).buffer() );


        });

        it("Should fail reading coils.", function (done) {
        
            var client = ModbusClient();

            client.readCoils(0, 10).fail(function (resp) {
            
                done();

            }).then(function () {
            
                assert.ok(false);
            
            }).done();

            client.setState('ready');
            client.emit('data', Put().word8be(0x81).word8be(1).buffer());
        
        });

    });

    describe('Read Discrete Inputs Tests.', function () {
 
        var ReadDiscreteInputs = require('../src/handler/client/ReadDiscreteInputs.js'),
            ModbusClient = stampit().compose(ModbusClientCore, ReadDiscreteInputs);
   
        it('should read discrete inputs just fine.', function (done) {
        
            var client = ModbusClient();

            client.readDiscreteInputs(0, 5).then(function (resp) {
           
                assert(resp.fc, 2);
                assert(resp.byteCount, 10);
                assert(resp.coils, [true, true, true, true, false, false, false, false]);

                done();
            
            }).fail(function () {
            
                assert.ok(false);
            
            }).done();

            client.setState('ready');
            client.emit('data', Put().word8be(2).word8be(1).word8be(15).buffer());
        
        });

        it('should fail reading discrete inputs.', function (done) {
        
            var client = ModbusClient();

            client.readDiscreteInputs(0, 5).then(function (resp) {
            
                assert.ok(false);
            
            }).fail(function (err) {
            
                done();
            
            }).done();

            client.setState('ready');
            client.emit('data', Put().word8be(0x82).word8be(0x02).buffer()); 
        
        });
    
    
    });

    describe('Read Holding Registers Tests.', function () {
 
        var ReadHoldingRegisters = require('../src/handler/client/ReadHoldingRegisters.js'),
            ModbusClient = stampit().compose(ModbusClientCore, ReadHoldingRegisters);
   
        it('should read holding register just fine.', function (done) {
        
            var client = ModbusClient(true);

            client.readHoldingRegisters(0, 5).then(function (resp) {
           
                assert(resp.fc, 3);
                assert(resp.byteCount, 10);
                assert(resp.register, [1, 2, 3, 4, 5]);

                done();
            
            }).fail(function () {
            
                assert.ok(false);
            
            }).done();

            client.setState('ready');
            client.emit(
                'data', 
                Put()
                    .word8be(3)
                    .word8be(10)
                    .word16be(1)
                    .word16be(2)
                    .word16be(3)
                    .word16be(4)
                    .word16be(5)
                    .buffer()
            );
        
        });

        it('should fail reading holding register.', function (done) {
        
            var client = ModbusClient();

            client.readHoldingRegisters(0, 5).then(function (resp) {
            
                assert.ok(false);
            
            }).fail(function (err) {
            
                done();
            
            }).done();

            client.setState('ready');
            client.emit('data', Put().word8be(0x83).word8be(0x03).buffer()); 
        
        });
    
    
    });

    describe('Read input registers tests.', function () {
 
        var ReadInputRegisters = require('../src/handler/client/ReadInputRegisters.js'),
            ModbusClient = stampit().compose(ModbusClientCore, ReadInputRegisters);
   
        it('should read input registers just fine.', function (done) {
        
            var client = ModbusClient(true);

            client.readInputRegisters(0, 5).then(function (resp) {
         
                assert(resp.fc, 4);
                assert(resp.byteCount, 10);
                assert(resp.register, [5, 4, 3, 2, 1]);

                done();
            
            }).fail(function () {
            
                done(true);
            
            }).done();

            client.setState('ready');
            client.emit(
                'data', 
                Put()
                    .word8be(4)
                    .word8be(10)
                    .word16be(5)
                    .word16be(4)
                    .word16be(3)
                    .word16be(2)
                    .word16be(1)
                    .buffer()
            );
        
        });

        it('should fail reading input register.', function (done) {
        
            var client = ModbusClient();

            client.readInputRegisters(0, 5).then(function (resp) {
            
                assert.ok(false);
            
            }).fail(function (err) {
            
                done();
            
            }).done();

            client.setState('ready');
            client.emit('data', Put().word8be(0x84).word8be(0x03).buffer()); 
        
        });
    
    
    });

    describe('Write single coil tests.', function () {
    
        var WriteSingleCoil = require('../src/handler/client/WriteSingleCoil.js'),
            ModbusClient = stampit().compose(ModbusClientCore, WriteSingleCoil);

        it('should write a single coil just fine.', function (done) {
        
            var client = ModbusClient(true);

            client.writeSingleCoil(3, true).then(function (resp) {
           
                assert(resp.fc, 5);
                assert(resp.outputAddress, 3);
                assert(resp.outputValue, true);

                done();
            
            }).fail(function () {
            
                assert.ok(false);
            
            }).done();

            client.setState('ready');
            client.emit(
                'data', 
                Put()
                    .word8be(5)
                    .word16be(3)
                    .word16be(0xFF00)
                    .buffer()
            );
        
        });

        it('should fail writing single coil.', function (done) {
        
            var client = ModbusClient();

            client.writeSingleCoil(4, false).then(function (resp) {
            
                done(true);

            }).fail(function (err) {
            
                done();
            
            }).done();

            client.setState('ready');
            client.emit('data', Put().word8be(0x85).word8be(0x04).buffer()); 
        
        });
    
    
    });

    describe('Write single register tests.', function () {

        var WriteSingleRegister = require('../src/handler/client/WriteSingleRegister.js'),
            ModbusClient = stampit().compose(ModbusClientCore, WriteSingleRegister);

        it('should write a single register just fine.', function (done) {
        
            var client = ModbusClient(true);

            client.writeSingleRegister(3, 123).then(function (resp) {
           
                assert(resp.fc, 6);
                assert(resp.registerAddress, 3);
                assert(resp.registerValue, 123);

                done();
            
            }).fail(function () {
            
                done(true);

            }).done();

            client.setState('ready');
            client.emit(
                'data', 
                Put()
                    .word8be(6)
                    .word16be(3)
                    .word16be(123)
                    .buffer()
            );
        
        });

        it('should fail writing single register.', function (done) {
        
            var client = ModbusClient();

            client.writeSingleRegister(4, false).then(function (resp) {
            
                done(true);

            }).fail(function (err) {
            
                done();
            
            }).done();

            client.setState('ready');
            client.emit('data', Put().word8be(0x86).word8be(0x01).buffer()); 
        
        });
    
    
    });

    describe('Write multiple coils tests.', function () {
 
        var WriteMultipleCoils = require('../src/handler/client/WriteMultipleCoils.js'),
            ModbusClient = stampit().compose(ModbusClientCore, WriteMultipleCoils);
   
        it('should write multiple coils just fine.', function (done) {
        
            var client = ModbusClient(true);

            client.writeMultipleCoils(3, [true, false, true, false]).then(function (resp) {
           
                assert(resp.fc, 6);
                assert(resp.startAddress, 3);
                assert(resp.quantity, 4);

                done();
            
            }).fail(function () {
            
                done(true);

            }).done();

            client.setState('ready');
            client.emit(
                'data', 
                Put()
                    .word8be(15)
                    .word16be(3)
                    .word16be(4)
                    .buffer()
            );
        
        });

        it('should fail writing multiple coils.', function (done) {
        
            var client = ModbusClient();

            client.writeMultipleCoils(4, [true, false, true, false]).then(function (resp) {
            
                done(true);

            }).fail(function (err) {
            
                done();
            
            }).done();

            client.setState('ready');
            client.emit('data', Put().word8be(0x8F).word8be(0x02).buffer()); 
        
        });
    
    
    });

    describe('Write multiple registers tests.', function () {
 
        var WriteMultipleRegisters = require('../src/handler/client/WriteMultipleRegisters.js'),
            ModbusClient = stampit().compose(ModbusClientCore, WriteMultipleRegisters);
   
        it('should write multiple registers just fine.', function (done) {
        
            var client = ModbusClient(true);

            client.writeMultipleRegisters(3, [1, 2, 3]).then(function (resp) {
           
                assert(resp.fc, 16);
                assert(resp.startAddress, 3);
                assert(resp.quantity, 3);

                done();
            
            }).fail(function () {
            
                done(true);

            }).done();

            client.setState('ready');
            client.emit(
                'data', 
                Put()
                    .word8be(0x10)
                    .word16be(0x0003)
                    .word16be(0x0004)
                    .word16be(0x0001)
                    .word16be(0x0002)
                    .word16be(0x0003)
                    .buffer()
            );
        
        });

        it('should fail writing multiple registers.', function (done) {
        
            var client = ModbusClient();

            client.writeMultipleRegisters(1025, [1, 2, 3]).then(function (resp) {
            
                done(true);

            }).fail(function (err) {
            
                done();
            
            }).done();

            client.setState('ready');
            client.emit('data', Put().word8be(0x90).word8be(0x02).buffer()); 
        
        });
    
    });


    describe('Timeout tests.', function () {
 
        var ReadHoldingRegisters = require('../src/handler/client/ReadHoldingRegisters.js'),
            ModbusClient = stampit().compose(ModbusClientCore, ReadHoldingRegisters);
   
        it('should timeout a read holding registers request.', function (done) {
        
            var client = ModbusClient({ 'timeout' : 200 });

            client.readHoldingRegisters(3, 10).then(function (resp) {
           
                done(true);
            
            }).fail(function (err) {
            
                done(err.err !== 'timeout');

            }).done();

            client.setState('ready');
       
        });

        it('should timeout a read holding registers request, but the request comes after the timeout.', function (done) {
        
            var client = ModbusClient({ 'timeout' : 200 });

            client.readHoldingRegisters(3, 10).then(function (resp) {
           
                done(true);
            
            }).fail(function (err) {
            
                assert(err.err, 'timeout');

            }).done();

            client.setState('ready');
       
            setTimeout(function () {
 
                client.emit(
                    'data', 
                    Put()
                        .word8be(3)
                        .word8be(10)
                        .word16be(1)
                        .word16be(2)
                        .word16be(3)
                        .word16be(4)
                        .word16be(5)
                        .buffer()
                    );
            
                done();
            
            }, 300);

        });


    }); 

});
