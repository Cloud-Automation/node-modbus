'use strict'

/* global describe, it */
var stampit = require('stampit')
var assert = require('assert')

describe('Modbus Serial Client', function () {
  var ModbusClientCore = require('../src/modbus-client-core.js')
  var ModbusClientInspector = require('./modbus-client-inspector.js')
  var ModbusClientBase = stampit().compose(ModbusClientCore, ModbusClientInspector)

  describe('Read Coils Tests.', function () {
    var ReadCoils = require('../src/handler/client/ReadCoils.js')
    var ModbusClient = stampit().compose(ModbusClientBase, ReadCoils)

    it('should read coils just fine.', function (done) {
      var client = ModbusClient()

      client.readCoils(0, 10).then(function (resp) {
        assert.equal(resp.fc, 1)
        assert.equal(resp.byteCount, 2)
        assert.equal(resp.coils.length, 16)
        assert.deepEqual(resp.payload, Buffer.from([85, 1]))
        assert.deepEqual(resp.coils, [true, false, true, false, true, false, true, false, true, false, false, false, false, false, false, false])

        done()
      }).done()

      client.setState('ready')
      client.emit('data', Buffer.from([1, 2, 85, 1]))
    })

    it('Should fail reading coils.', function (done) {
      var client = ModbusClient()

      client.readCoils(0, 10).catch(function (resp) {
        done()
      }).done()

      client.setState('ready')
      client.emit('data', Buffer.from([0x81, 0x01]))
    })
  })

  describe('Read Discrete Inputs Tests.', function () {
    var ReadDiscreteInputs = require('../src/handler/client/ReadDiscreteInputs.js')
    var ModbusClient = stampit().compose(ModbusClientBase, ReadDiscreteInputs)

    it('should read discrete inputs just fine.', function (done) {
      var client = ModbusClient()

      client.readDiscreteInputs(0, 5).then(function (resp) {
        assert.equal(resp.fc, 2)
        assert.equal(resp.byteCount, 1)
        assert.equal(resp.coils.length, 8)
        assert.deepEqual(resp.payload, Buffer.from([15]))
        assert.deepEqual(resp.coils, [true, true, true, true, false, false, false, false])

        done()
      }).done()

      client.setState('ready')
      client.emit('data', Buffer.from([0x02, 0x01, 0x0F]))
    })

    it('should fail reading discrete inputs.', function (done) {
      var client = ModbusClient()

      client.readDiscreteInputs(0, 5).then(function (resp) {
        assert.ok(false)
      }).catch(function () {
        done()
      }).done()

      client.setState('ready')
      client.emit('data', Buffer.from([0x82, 0x02]))
    })
  })

  describe('Read Holding Registers Tests.', function () {
    var ReadHoldingRegisters = require('../src/handler/client/ReadHoldingRegisters.js')
    var ModbusClient = stampit().compose(ModbusClientBase, ReadHoldingRegisters)

    it('should read holding register just fine.', function (done) {
      var client = ModbusClient(true)

      client.readHoldingRegisters(0, 5).then(function (resp) {
        assert.equal(resp.fc, 3)
        assert.equal(resp.byteCount, 10)
        assert.deepEqual(resp.payload, Buffer.from([0, 1, 0, 2, 0, 3, 0, 4, 0, 5]))
        assert.deepEqual(resp.register, [1, 2, 3, 4, 5])

        done()
      }).done()

      client.setState('ready')
      client.emit(
        'data',
        Buffer.from([0x03, 0x0A, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x00, 0x04, 0x00, 0x05])
      )
    })

    it('should fail reading holding register.', function (done) {
      var client = ModbusClient()

      client.readHoldingRegisters(0, 5).then(function (resp) {
        assert.ok(false)
      }).catch(function () {
        done()
      }).done()

      client.setState('ready')
      client.emit('data', Buffer.from([0x83, 0x03]))
    })
  })

  describe('Read input registers tests.', function () {
    var ReadInputRegisters = require('../src/handler/client/ReadInputRegisters.js')
    var ModbusClient = stampit().compose(ModbusClientBase, ReadInputRegisters)

    it('should read input registers just fine.', function (done) {
      var client = ModbusClient(true)

      client.readInputRegisters(0, 5).then(function (resp) {
        assert.equal(resp.fc, 4)
        assert.equal(resp.byteCount, 10)
        assert.deepEqual(resp.payload, Buffer.from([0, 5, 0, 4, 0, 3, 0, 2, 0, 1]))
        assert.deepEqual(resp.register, [5, 4, 3, 2, 1])

        done()
      }).done()

      client.setState('ready')
      client.emit(
        'data',
        Buffer.from([0x04, 0x0A, 0x00, 0x05, 0x00, 0x04, 0x00, 0x03, 0x00, 0x02, 0x00, 0x01])
      )
    })

    it('should fail reading input register.', function (done) {
      var client = ModbusClient()

      client.readInputRegisters(0, 5).then(function (resp) {
        assert.ok(false)
      }).catch(function () {
        done()
      }).done()

      client.setState('ready')
      client.emit('data', Buffer.from([0x84, 0x03]))
    })
  })

  describe('Write single coil tests.', function () {
    var WriteSingleCoil = require('../src/handler/client/WriteSingleCoil.js')
    var ModbusClient = stampit().compose(ModbusClientBase, WriteSingleCoil)

    it('should write a single coil just fine.', function (done) {
      var client = ModbusClient(true)

      client.writeSingleCoil(3, true).then(function (resp) {
        assert.equal(resp.fc, 5)
        assert.equal(resp.outputAddress, 3)
        assert.equal(resp.outputValue, true)

        done()
      }).done()

      var pdu = client.queueSpy().pdu

      assert.equal(pdu.readUInt8(0), 5)
      assert.equal(pdu.readUInt16BE(1), 3)
      assert.equal(pdu.readUInt16BE(3), 0xff00)

      client.setState('ready')
      client.emit(
        'data',
        Buffer.from([0x05, 0x00, 0x03, 0xFF, 0x00])
      )
    })

    it('should write a single coil with Buffer param true just fine.', function (done) {
      var client = ModbusClient(true)

      client.writeSingleCoil(3, Buffer.from([1])).then(function (resp) {
        assert.equal(resp.fc, 5)
        assert.equal(resp.outputAddress, 3)
        assert.equal(resp.outputValue, true)

        done()
      }).done()

      var pdu = client.queueSpy().pdu

      assert.equal(pdu.readUInt8(0), 5)
      assert.equal(pdu.readUInt16BE(1), 3)
      assert.equal(pdu.readUInt16BE(3), 0xff00)

      client.setState('ready')
      client.emit(
        'data',
        Buffer.from([0x05, 0x00, 0x03, 0xFF, 0x00])
      )
    })

    it('should write a single coil with Buffer param false just fine.', function (done) {
      var client = ModbusClient(true)

      client.writeSingleCoil(3, Buffer.from([0])).then(function (resp) {
        assert.equal(resp.fc, 5)
        assert.equal(resp.outputAddress, 3)
        assert.equal(resp.outputValue, false)

        done()
      }).done()

      var pdu = client.queueSpy().pdu

      assert.equal(pdu.readUInt8(0), 5)
      assert.equal(pdu.readUInt16BE(1), 3)
      assert.equal(pdu.readUInt16BE(3), 0x0000)

      client.setState('ready')
      client.emit(
        'data',
        Buffer.from([0x05, 0x00, 0x03, 0x00, 0x00])
      )
    })

    it('should fail writing single coil.', function (done) {
      var client = ModbusClient()

      client.writeSingleCoil(4, false).then(function (resp) {
        done(true)
      }).catch(function () {
        done()
      }).done()

      client.setState('ready')
      client.emit('data', Buffer.from([0x85, 0x04]))
    })
  })

  describe('Write single register tests.', function () {
    var WriteSingleRegister = require('../src/handler/client/WriteSingleRegister.js')
    var ModbusClient = stampit().compose(ModbusClientBase, WriteSingleRegister)

    it('should write a single register just fine.', function (done) {
      var client = ModbusClient(true)

      client.writeSingleRegister(3, 123).then(function (resp) {
        assert.equal(resp.fc, 6)
        assert.equal(resp.registerAddress, 3)
        assert.deepEqual(resp.registerAddressRaw, Buffer.from([0x00, 0x03]))
        assert.equal(resp.registerValue, 123)
        assert.deepEqual(resp.registerValueRaw, Buffer.from([0x00, 0x7b]))

        done()
      }).done()

      var pdu = client.queueSpy().pdu

      assert.equal(pdu.readUInt8(0), 6)
      assert.equal(pdu.readUInt16BE(1), 3)
      assert.equal(pdu.readUInt16BE(3), 0x007b)

      client.setState('ready')
      client.emit(
        'data',
        Buffer.from([0x06, 0x00, 0x03, 0x00, 0x7B])
      )
    })

    it('should write a single register with buffer payload just fine.', function (done) {
      var client = ModbusClient(true)

      client.writeSingleRegister(3, Buffer.from([0x00, 0x7b])).then(function (resp) {
        assert.equal(resp.fc, 6)
        assert.equal(resp.registerAddress, 3)
        assert.equal(resp.registerValue, 123)
        assert.deepEqual(resp.registerAddressRaw, Buffer.from([0x00, 0x03]))
        assert.deepEqual(resp.registerValueRaw, Buffer.from([0x00, 0x7b]))

        done()
      }).done()

      var pdu = client.queueSpy().pdu

      assert.equal(pdu.readUInt8(0), 6)
      assert.equal(pdu.readUInt16BE(1), 3)
      assert.equal(pdu.readUInt16BE(3), 0x007b)

      client.setState('ready')
      client.emit(
        'data',
        Buffer.from([0x06, 0x00, 0x03, 0x00, 0x7B])
      )
    })

    it('should fail writing single register.', function (done) {
      var client = ModbusClient()

      client.writeSingleRegister(4, false).then(function (resp) {
        done(true)
      }).catch(function () {
        done()
      }).done()

      client.setState('ready')
      client.emit('data', Buffer.from([0x86, 0x01]))
    })
  })

  describe('Write multiple coils tests.', function () {
    var WriteMultipleCoils = require('../src/handler/client/WriteMultipleCoils.js')
    var ModbusClient = stampit().compose(ModbusClientBase, WriteMultipleCoils)

    it('should write multiple coils just fine.', function (done) {
      var client = ModbusClient(true)

      client.writeMultipleCoils(20, [true, false, true, true, false, false, true, true, true, false])
        .then(function (resp) {
          assert.equal(resp.fc, 15)
          assert.equal(resp.startAddress, 20)
          assert.equal(resp.quantity, 10)

          done()
        }).done()

      var pdu = client.queueSpy().pdu

      assert.equal(pdu.readUInt8(0), 15) // fc
      assert.equal(pdu.length, 8)
      assert.equal(pdu.readUInt16BE(1), 20) // startAddress
      assert.equal(pdu.readUInt16BE(3), 10) // coilCount
      assert.equal(pdu.readUInt8(5), 2) // byteCount
      assert.equal(pdu.readUInt8(6), 0xCD) // registerValue
      assert.equal(pdu.readUInt8(7), 0x01) // registerValue

      client.setState('ready')
      client.emit(
        'data',
        Buffer.from([0x0F, 0x00, 0x14, 0x00, 0x0A, 0x02, 0xCD, 0x01])
      )
    })

    it('should write multiple coils with buffer payload just fine.', function (done) {
      var client = ModbusClient(true)

      client.writeMultipleCoils(20, Buffer.from([0xCD, 0x01]), 10)
        .then(function (resp) {
          assert.equal(resp.fc, 15)
          assert.equal(resp.startAddress, 20)
          assert.equal(resp.quantity, 10)

          done()
        }).done()

      var pdu = client.queueSpy().pdu

      assert.equal(pdu.readUInt8(0), 15) // fc
      assert.equal(pdu.length, 8)
      assert.equal(pdu.readUInt16BE(1), 20) // startAddress
      assert.equal(pdu.readUInt16BE(3), 10) // coilCount
      assert.equal(pdu.readUInt8(5), 2) // byteCount
      assert.equal(pdu.readUInt8(6), 0xCD) // registerValue
      assert.equal(pdu.readUInt8(7), 0x01) // registerValue

      client.setState('ready')
      client.emit(
        'data',
        Buffer.from([0x0F, 0x00, 0x14, 0x00, 0x0A, 0x02, 0xCD, 0x01])
      )
    })

    it('should fail writing multiple coils.', function (done) {
      var client = ModbusClient()

      client.writeMultipleCoils(4, [true, false, true, false]).then(function (resp) {
        done(true)
      }).catch(function () {
        done()
      }).done()

      client.setState('ready')
      client.emit('data', Buffer.from([0x8F, 0x02]))
    })
  })

  describe('Write multiple registers tests.', function () {
    var WriteMultipleRegisters = require('../src/handler/client/WriteMultipleRegisters.js')
    var ModbusClient = stampit().compose(ModbusClientBase, WriteMultipleRegisters)

    it('should write multiple registers just fine.', function (done) {
      var client = ModbusClient(true)

      client.writeMultipleRegisters(3, [1, 2, 350]).then(function (resp) {
        assert.equal(resp.fc, 16)
        assert.equal(resp.startAddress, 3)
        assert.equal(resp.quantity, 3)

        done()
      }).done()

      var pdu = client.queueSpy().pdu

      assert.equal(pdu.readUInt8(0), 16) // fc
      assert.equal(pdu.length, 12)
      assert.equal(pdu.readUInt16BE(1), 3) // startAddress
      assert.equal(pdu.readUInt16BE(3), 3) // registerCount
      assert.equal(pdu.readUInt8(5), 6) // byteCount
      assert.equal(pdu.readUInt16BE(6), 1) // registerValue
      assert.equal(pdu.readUInt16BE(8), 2) // registerValue
      assert.equal(pdu.readUInt16BE(10), 350) // registerValue

      client.setState('ready')
      client.emit(
        'data',
        Buffer.from([0x10, 0x00, 0x03, 0x00, 0x03, 0x00, 0x01, 0x00, 0x02, 0x01, 0x6F])
      )
    })

    it('should write multiple registers with buffer payload just fine.', function () {
      var client = ModbusClient(true)

      client.writeMultipleRegisters(3, Buffer.from([0x00, 0xc4]))

      var pdu = client.queueSpy().pdu

      assert.equal(pdu.readUInt8(0), 16) // fc
      assert.equal(pdu.length, 8)
      assert.equal(pdu.readUInt16BE(1), 3) // startAddress
      assert.equal(pdu.readUInt16BE(3), 1) // registerCount
      assert.equal(pdu.readUInt8(5), 2) // byteCount
      assert.equal(pdu.readUInt16BE(6), 196) // registerValue
    })

    it('should fail writing multiple registers.', function (done) {
      var client = ModbusClient()

      client.writeMultipleRegisters(1025, [1, 2, 3]).then(function (resp) {
        done(true)
      }).catch(function () {
        done()
      }).done()

      client.setState('ready')
      client.emit('data', Buffer.from([0x90, 0x02]))
    })
  })

  describe('Timeout tests.', function () {
    var ReadHoldingRegisters = require('../src/handler/client/ReadHoldingRegisters.js')
    var ModbusClient = stampit().compose(ModbusClientBase, ReadHoldingRegisters)

    it('should timeout a read holding registers request.', function (done) {
      var client = ModbusClient({ 'timeout': 200 })

      client.readHoldingRegisters(3, 10).then(function (resp) {}).catch(function (err) {
        assert.equal(err.err, 'timeout')
        done()
      })

      client.setState('ready')
    })

    it('should timeout a read holding registers request, but the request comes after the timeout.', function (done) {
      var client = ModbusClient({ 'timeout': 200 })

      client.readHoldingRegisters(3, 10).then(function (resp) {
        done(true)
      }).catch(function (err) {
        assert.equal(err.err, 'timeout')
      }).done()

      client.setState('ready')

      setTimeout(function () {
        client.emit(
          'data',
          Buffer.from([0x03, 0x0A, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x00, 0x04, 0x00, 0x05])
        )

        done()
      }, 300)
    })
  })
})
