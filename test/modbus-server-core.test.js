'use strict'

/* global describe, it */
var stampit = require('stampit')
var assert = require('assert')

describe('Modbus Server Core Tests.', function () {
  var ModbusCore = require('../src/modbus-server-core.js').refs({ 'logEnabled': true })

  describe('Exception Tests.', function () {
    it('should answer with 0x8x status code due to missing handler.', function (done) {
      var core = ModbusCore()
      var request = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x0A])
      var exResponse = Buffer.from([0x81, 0x01])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)
        done()
      }

      core.onData(request, resp)
    })
  })

  describe('Read Coils Tests.', function () {
    var ReadCoils = require('../src/handler/server/ReadCoils.js')
    var Core = stampit().compose(ModbusCore, ReadCoils)

    it('should handle a read coils request just fine.', function (done) {
      var core = Core()
      var request = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x05])
      var exResponse = Buffer.from([0x01, 0x01, 0x15])

      core.getCoils().writeUInt8(0x15, 0)

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a read coils request with odd start address just fine.', function (done) {
      var core = Core()
      var request = Buffer.from([0x01, 0x00, 0x02, 0x00, 0x05])
      var exResponse = Buffer.from([0x01, 0x01, 0x05])

      core.getCoils().writeUInt8(0x15, 0)

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a read coils request with a start address outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x01, 0x20, 0x01, 0x00, 10])
      var exResponse = Buffer.from([0x81, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a read coils request with a quantity value outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x01, 0x1f, 0xf8, 0x00, 9])
      var exResponse = Buffer.from([0x81, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })
  })

  describe('Read Discrete Inputs Tests.', function () {
    var ReadDiscreteInputs = require('../src/handler/server/ReadDiscreteInputs.js')
    var Core = stampit().compose(ModbusCore, ReadDiscreteInputs)

    it('should handle a read discrete inputs request just fine.', function (done) {
      var core = Core()
      var request = Buffer.from([0x02, 0x00, 0, 0x00, 5])
      var exResponse = Buffer.from([0x02, 1, 0x15])

      core.getInput().writeUInt8(0x15, 0)

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a read discrete inputs request with odd start address just fine.', function (done) {
      var core = Core()
      var request = Buffer.from([0x02, 0x00, 2, 0x00, 5])
      var exResponse = Buffer.from([0x02, 1, 0x05])

      core.getInput().writeUInt8(0x15, 0)

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a read discrete inputs request with a start address outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x02, 0x20, 0x01, 0x00, 10])
      var exResponse = Buffer.from([0x82, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a read discrete inputs request with a quantity value outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x02, 0x1F, 0xF8, 0x00, 9])
      var exResponse = Buffer.from([0x82, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })
  })

  describe('Read Holding Registers Tests.', function () {
    var ReadHoldingRegisters = require('../src/handler/server/ReadHoldingRegisters.js')
    var Core = stampit().compose(ModbusCore, ReadHoldingRegisters)

    it('should handle a read holding registers request just fine.', function (done) {
      var core = Core()
      var request = Buffer.from([0x03, 0x00, 0x01, 0x00, 0x04])
      var exResponse = Buffer.from([0x03, 0x08, 0x00, 0x02, 0x00, 0x03, 0x00, 0x04, 0x00, 0x05])

      core.getHolding().writeUInt16BE(0x01, 0)
      core.getHolding().writeUInt16BE(0x02, 2)
      core.getHolding().writeUInt16BE(0x03, 4)
      core.getHolding().writeUInt16BE(0x04, 6)
      core.getHolding().writeUInt16BE(0x05, 8)

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)
        done()
      }

      core.onData(request, resp)
    })

    it('should handle a read holding registers request with a start address outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x03, 0x04, 0x05, 0x00, 10])
      var exResponse = Buffer.from([0x83, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)
        done()
      }

      core.onData(request, resp)
    })

    it('should handle a read holding registers request with a quantity value outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x03, 0x04, 0x03, 0x00, 1])
      var exResponse = Buffer.from([0x83, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })
  })

  describe('Read Input Registers Tests.', function () {
    var ReadInputRegisters = require('../src/handler/server/ReadInputRegisters.js')
    var Core = stampit().compose(ModbusCore, ReadInputRegisters)

    it('should handle a read input registers request just fine.', function (done) {
      var core = Core()
      var request = Buffer.from([0x04, 0x00, 0x01, 0x00, 0x04])
      var exResponse = Buffer.from([0x04, 0x08, 0x00, 4, 0x00, 3, 0x00, 2, 0x00, 1])

      core.getInput().writeUInt16BE(0x05, 0)
      core.getInput().writeUInt16BE(0x04, 2)
      core.getInput().writeUInt16BE(0x03, 4)
      core.getInput().writeUInt16BE(0x02, 6)
      core.getInput().writeUInt16BE(0x01, 8)

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a read input registers request with a start address outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x04, 0x04, 0x05, 0x00, 10])
      var exResponse = Buffer.from([0x84, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a read input registers request with a quantity value outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x04, 0x04, 0x03, 0x00, 1])
      var exResponse = Buffer.from([0x84, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })
  })

  describe('Write Single Coil Tests.', function () {
    var WriteSingleCoil = require('../src/handler/server/WriteSingleCoil.js')
    var Core = stampit().compose(ModbusCore, WriteSingleCoil)

    it('should handle a write single coil request just fine.', function (done) {
      var core = Core()
      var request = Buffer.from([0x05, 0x00, 8, 0xff, 0x00])
      var exResponse = Buffer.from([0x05, 0x00, 8, 0xff, 0x00])

      core.getCoils().writeUInt8(0, 1)

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)
        assert.equal(core.getCoils().readUInt8(1), 1)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a write single coil request with a start address outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x05, 0x20, 0x01, 0x00, 0xff00])
      var exResponse = Buffer.from([0x85, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a write single coil request with a another value than 0x0000 (false) and 0xff00 (true).', function (done) {
      var core = Core()
      var request = Buffer.from([0x05, 0x00, 8, 0xf3, 0x00])
      var exResponse = Buffer.from([0x85, 0x03])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })
  })

  describe('Write Single Register Tests.', function () {
    var WriteSingleRegister = require('../src/handler/server/WriteSingleRegister.js')
    var Core = stampit().compose(ModbusCore, WriteSingleRegister)

    it('should handle a write single register request just fine.', function (done) {
      var core = Core()
      var request = Buffer.from([0x06, 0x00, 8, 0x01, 0x23])
      var exResponse = Buffer.from([0x06, 0x00, 8, 0x01, 0x23])

      core.getHolding().writeUInt16BE(0x0123, 8)

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)
        assert.equal(core.getHolding().readUInt16BE(8), 0x0123)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a write single register request with a start address outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x06, 0x04, 0x05, 0x01, 0x23])
      var exResponse = Buffer.from([0x86, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })
  })

  describe('Write Multiple Coils Tests.', function () {
    var WriteMultipleCoils = require('../src/handler/server/WriteMultipleCoils.js')
    var Core = stampit().compose(ModbusCore, WriteMultipleCoils)

    it('should handle a write multiple coils request just fine.', function (done) {
      var core = Core()
      var request = Buffer.from([0x0F, 0x00, 12, 0x00, 4, 1, 0x0F])
      var exResponse = Buffer.from([0x0F, 0x00, 12, 0x00, 4])

      core.getCoils().writeUInt8(0x0F, 1)

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)
        assert.equal(core.getCoils().readUInt8(1), 0xFF)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a write multiple coils request with a start address outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x0F, 0x20, 0x01, 0x00, 0x04, 0x01, 0x0F])
      var exResponse = Buffer.from([0x8F, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a write multiple coils request with a start and quantity outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x0F, 0x1F, 0xFD, 0x00, 4, 1, 0x0F])
      var exResponse = Buffer.from([0x8F, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })
  })

  describe('Write Multiple Registers Tests.', function () {
    var WriteMultipleRegisters = require('../src/handler/server/WriteMultipleRegisters.js')
    var Core = stampit().compose(ModbusCore, WriteMultipleRegisters)

    it('should handle a write multiple registers request just fine.', function (done) {
      var core = Core()
      var request = Buffer.from([0x10, 0x00, 0x05, 0x00, 0x03, 0x06, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03])
      var exResponse = Buffer.from([0x10, 0x00, 0x05, 0x00, 0x03])

      core.getHolding().writeUInt16BE(0x0000, 10)
      core.getHolding().writeUInt16BE(0x0000, 12)
      core.getHolding().writeUInt16BE(0x0000, 14)

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)
        assert.equal(core.getHolding().readUInt16BE(10), 0x0001)
        assert.equal(core.getHolding().readUInt16BE(12), 0x0002)
        assert.equal(core.getHolding().readUInt16BE(14), 0x0003)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a write multiple registers request with a start address outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x10, 0x04, 0x05, 0x00, 0x02, 0x04, 0x00, 0x01, 0x00, 0x02])
      var exResponse = Buffer.from([0x90, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a write multiple registers request with a start and quantity outside the address space.', function (done) {
      var core = Core()
      var request = Buffer.from([0x10, 0x04, 0x02, 0x00, 0x02, 0x04, 0x00, 0x01, 0x00, 0x02])
      var exResponse = Buffer.from([0x90, 0x02])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })

    it('should handle a write multiple registers request with a quantity greater 0x007b.', function (done) {
      var core = Core()
      var request = Buffer.from([0x10, 0x00, 0x00, 0x00, 0x7c, 0xf8, 0x00, 0x01, 0x00, 0x02])
      var exResponse = Buffer.from([0x90, 0x03])

      var resp = function (response) {
        assert.equal(response.compare(exResponse), 0)

        done()
      }

      core.onData(request, resp)
    })
  })
})
