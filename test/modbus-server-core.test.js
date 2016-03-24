var stampit         = require('stampit'),
    assert          = require("assert"),
    Put             = require('put'),
    sinon           = require('sinon'),
    util            = require('util'),
    eventEmitter    = require('events').EventEmitter;

describe("Modbus Server Core Tests.", function () {

    var ModbusCore = require('../src/modbus-server-core.js').refs({ 'logEnabled' : true });

    describe('Exception Tests.', function () {
    
        it('should answer with 0x8x status code due to missing handler.', function (done) {
        
            var core        = ModbusCore(),
                request     = Put().word8(1).word16be(0).word16be(10).buffer(),
                exResponse  = Put().word8(0x81).word8(0x01).buffer();

            var resp = function (response) {
           
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp); 
        
        });

    });

    describe('Read Coils Tests.', function () {

        var ReadCoils = require('../src/handler/server/ReadCoils.js'),
            Core = stampit().compose(ModbusCore, ReadCoils);

        it('should handle a read coils request just fine.', function (done) {

            var core        = Core(),
                request     = Put().word8(0x01).word16be(0).word16be(5).buffer(),
                exResponse  = Put().word8(0x01).word8(1).word8(0x15).buffer();         
     
            core.getCoils().writeUInt8(0x15, 0); 

            var resp = function (response) {
           
                assert.equal(response.compare(exResponse), 0);

                done();

            };

            core.onData(request, resp);
                    
        });

        it('should handle a read coils request with a start address outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x01).word16be(1024 * 8 + 1).word16be(10).buffer(),
                exResponse  = Put().word8(0x81).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
 
        it('should handle a read coils request with a quantity value outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x01).word16be(1023 * 8).word16be(9).buffer(),
                exResponse  = Put().word8(0x81).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
    
    });

    describe('Read Discrete Inputs Tests.', function () {

        var ReadDiscreteInputs = require('../src/handler/server/ReadDiscreteInputs.js'),
            Core = stampit().compose(ModbusCore, ReadDiscreteInputs);

        it('should handle a read discrete inputs request just fine.', function (done) {

            var core        = Core(),
                request     = Put().word8(0x02).word16be(0).word16be(5).buffer(),
                exResponse  = Put().word8(0x02).word8(1).word8(0x15).buffer();         
     
            core.getInput().writeUInt8(0x15, 0); 

            var resp = function (response) {
           
                assert.equal(response.compare(exResponse), 0);

                done();

            };

            core.onData(request, resp);
                    
        });

        it('should handle a read discrete inputs request with a start address outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x02).word16be(1024 * 8 + 1).word16be(10).buffer(),
                exResponse  = Put().word8(0x82).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
 
        it('should handle a read discrete inputs request with a quantity value outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x02).word16be(1023 * 8).word16be(9).buffer(),
                exResponse  = Put().word8(0x82).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
    
    });

    describe('Read Holding Registers Tests.', function () {

        var ReadHoldingRegisters = require('../src/handler/server/ReadHoldingRegisters.js'),
            Core = stampit().compose(ModbusCore, ReadHoldingRegisters);

        it('should handle a read holding registers request just fine.', function (done) {

            var core        = Core(),
                request     = Put().word8(0x03).word16be(0).word16be(5).buffer(),
                exResponse  = Put().word8(0x03).word8(10).word16be(1).word16be(2).word16be(3).word16be(4).word16be(5).buffer();          
            core.getHolding().writeUInt16BE(0x01, 0); 
            core.getHolding().writeUInt16BE(0x02, 2); 
            core.getHolding().writeUInt16BE(0x03, 4); 
            core.getHolding().writeUInt16BE(0x04, 6); 
            core.getHolding().writeUInt16BE(0x05, 8); 

            var resp = function (response) {
           
                assert.equal(response.compare(exResponse), 0);

                done();

            };

            core.onData(request, resp);
                    
        });

        it('should handle a read holding registers request with a start address outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x03).word16be(1024 + 1).word16be(10).buffer(),
                exResponse  = Put().word8(0x83).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
 
        it('should handle a read holding registers request with a quantity value outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x03).word16be(1023).word16be(1).buffer(),
                exResponse  = Put().word8(0x83).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
    });



    describe('Read Input Registers Tests.', function () {

        var ReadInputRegisters = require('../src/handler/server/ReadInputRegisters.js'),
            Core = stampit().compose(ModbusCore, ReadInputRegisters);

        it('should handle a read input registers request just fine.', function (done) {

            var core        = Core(),
                request     = Put().word8(0x04).word16be(0).word16be(5).buffer(),
                exResponse  = Put().word8(0x04).word8(10).word16be(5).word16be(4).word16be(3).word16be(2).word16be(1).buffer();          
            core.getInput().writeUInt16BE(0x05, 0); 
            core.getInput().writeUInt16BE(0x04, 2); 
            core.getInput().writeUInt16BE(0x03, 4); 
            core.getInput().writeUInt16BE(0x02, 6); 
            core.getInput().writeUInt16BE(0x01, 8); 

            var resp = function (response) {
           
                assert.equal(response.compare(exResponse), 0);

                done();

            };

            core.onData(request, resp);
                    
        });

        it('should handle a read input registers request with a start address outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x04).word16be(1024 +1).word16be(10).buffer(),
                exResponse  = Put().word8(0x84).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
 
        it('should handle a read input registers request with a quantity value outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x04).word16be(1023).word16be(1).buffer(),
                exResponse  = Put().word8(0x84).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
    });

    describe('Write Single Coil Tests.', function () {

        var WriteSingleCoil = require('../src/handler/server/WriteSingleCoil.js'),
            Core = stampit().compose(ModbusCore, WriteSingleCoil);

        it('should handle a write single coil request just fine.', function (done) {

            var core        = Core(),
                request     = Put().word8(0x05).word16be(8).word16be(0xff00).buffer(),
                exResponse  = Put().word8(0x05).word16be(8).word16be(0xff00).buffer();

            core.getCoils().writeUInt8(0, 1);

            var resp = function (response) {
           
                assert.equal(response.compare(exResponse), 0);
                assert.equal(core.getCoils().readUInt8(1), 1);

                done();

            };

            core.onData(request, resp);
                    
        });

        it('should handle a write single coil request with a start address outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x05).word16be(1024 * 8 + 1).word16be(0xff00).buffer(),
                exResponse  = Put().word8(0x85).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
 
        it('should handle a write single coil request with a another value than 0x0000 (false) and 0xff00 (true).', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x05).word16be(8).word16be(0xf300).buffer(),
                exResponse  = Put().word8(0x85).word8be(0x03).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
    
    });



    describe('Write Single Register Tests.', function () {

        var WriteSingleRegister = require('../src/handler/server/WriteSingleRegister.js'),
            Core = stampit().compose(ModbusCore, WriteSingleRegister);

        it('should handle a write single register request just fine.', function (done) {

            var core        = Core(),
                request     = Put().word8(0x06).word16be(8).word16be(0x0123).buffer(),
                exResponse  = Put().word8(0x06).word16be(8).word16be(0x0123).buffer();

            core.getHolding().writeUInt16BE(0x0123, 8);

            var resp = function (response) {
           
                assert.equal(response.compare(exResponse), 0);
                assert.equal(core.getHolding().readUInt16BE(8), 0x0123);

                done();

            };

            core.onData(request, resp);
                    
        });

        it('should handle a write single register request with a start address outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x06).word16be(1024 + 1).word16be(0x0123).buffer(),
                exResponse  = Put().word8(0x86).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
 
    });

    describe('Write Multiple Coils Tests.', function () {

        var WriteMultipleCoils = require('../src/handler/server/WriteMultipleCoils.js'),
            Core = stampit().compose(ModbusCore, WriteMultipleCoils);

        it('should handle a write multiple coils request just fine.', function (done) {

            var core        = Core(),
                request     = Put().word8(0x0F).word16be(12).word16be(4).word8(1).word8(0x0F).buffer(),
                exResponse  = Put().word8(0x0F).word16be(12).word16be(4).buffer();

            core.getCoils().writeUInt8(0x0F, 1);

            var resp = function (response) {
           
                assert.equal(response.compare(exResponse), 0);
                assert.equal(core.getCoils().readUInt8(1), 0xFF);

                done();

            };

            core.onData(request, resp);
                    
        });

        it('should handle a write multiple coils request with a start address outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x0F).word16be(1024 * 8 + 1).word16be(4).word8(1).word8(0x0F).buffer(),
                exResponse  = Put().word8(0x8F).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });

        it('should handle a write multiple coils request with a start and quantity outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x0F).word16be(1024 * 8 - 3).word16be(4).word8(1).word8(0x0F).buffer(),
                exResponse  = Put().word8(0x8F).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
 
 
    });

    describe('Write Multiple Registers Tests.', function () {

        var WriteMultipleRegisters = require('../src/handler/server/WriteMultipleRegisters.js'),
            Core = stampit().compose(ModbusCore, WriteMultipleRegisters);

        it('should handle a write multiple registers request just fine.', function (done) {

            var core        = Core(),
                request     = Put()
                    .word8(0x10)
                    .word16be(5)
                    .word16be(3)
                    .word8(6)
                    .word16be(0x0001)
                    .word16be(0x0002)
                    .word16be(0x0003)
                    .buffer(),
                exResponse  = Put()
                    .word8(0x10)
                    .word16be(5)
                    .word16be(3)
                    .buffer();

            core.getHolding().writeUInt16BE(0x0000, 10);
            core.getHolding().writeUInt16BE(0x0000, 12);
            core.getHolding().writeUInt16BE(0x0000, 14);

            var resp = function (response) {
          
                assert.equal(response.compare(exResponse), 0);
                assert.equal(core.getHolding().readUInt16BE(10), 0x0001);
                assert.equal(core.getHolding().readUInt16BE(12), 0x0002);
                assert.equal(core.getHolding().readUInt16BE(14), 0x0003);

                done();

            };

            core.onData(request, resp);
                    
        });

        it('should handle a write multiple registers request with a start address outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x10).word16be(1025).word16be(2).word8(4).word16be(0x01).word16be(0x02).buffer(),
                exResponse  = Put().word8(0x90).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });

        it('should handle a write multiple registers request with a start and quantity outside the address space.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x10).word16be(1022).word16be(2).word8(4).word16be(0x01).word16be(0x02).buffer(),
                exResponse  = Put().word8(0x90).word8be(0x02).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
 
        it('should handle a write multiple registers request with a quantity greater 0x007b.', function (done) {
        
            var core        = Core(),
                request     = Put().word8(0x10).word16be(0).word16be(0x007c).word8(0xf8).word16be(0x01).word16be(0x02).buffer(),
                exResponse  = Put().word8(0x90).word8be(0x03).buffer();

            var resp = function (response) {
            
                assert.equal(response.compare(exResponse), 0);

                done();
            
            };

            core.onData(request, resp);
        
        });
 

    });



});
