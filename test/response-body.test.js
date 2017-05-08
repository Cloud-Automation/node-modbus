'use strict'

/* global describe, it */

let assert = require('assert')

describe('Modbus Response Tests.', function () {
  /* with the read coils tests we test most of the common errors
   * like modbus exceptions, outOfSync errors, timeouts and so on */
  describe('Read Coils Tests.', function () {
    let ReadCoilsResponseBody = require('../src/response/read-coils.js')
    it('should create request from buffer', function () {
      let buffer = Buffer.from([
        0x02,       // byte count
        0xdd,       // coils
        0x00
      ])

      let response = ReadCoilsResponseBody.fromBuffer(buffer)

      assert.ok(response !== null)
      assert.equal(0x01, response.fc)
      assert.equal(0x02, response.length)
      assert.equal(0x04, response.byteCount)
      assert.deepEqual(
        [true,
        false,
        true,
        true,
        true,
        false,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false], response.coils)
    })
    it('should handle invalid buffer content', function () {
      let buffer = Buffer.from([
        0x02,       // byte count
        0xdd       // coils
      ])

      let response = ReadCoilsResponseBody.fromBuffer(buffer)

      assert.ok(response === null)
    })
  })
  /*
    it('should handle a invalid request (invalid quantity)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.readCoils(10, 0x7D01)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (e) {
          assert.equal('InvalidQuantity', e.err)
          socketMock.verify()
          done()
        })
    })
    it('should handle a valid request with a exception response', function (done) {
      let client = new Modbus.client.TCP(socket)
      let response = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x03, // byte count
        0x01,       // unit id
        0x81,       // function code
        0x01        // exception code
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.readCoils(10, 11)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (e) {
          assert.equal('ModbusException', e.err)
          assert.equal(0x01, e.response.body.fc)
          assert.equal(0x01, e.response.body.code)
          socketMock.verify()
          done()
        })

      socket.emit('data', response)
    })
    it('should handle a valid request with timeout', function (done) {
      let client = new Modbus.client.TCP(socket, 2, 100) // unit id = 2, timeout = 100ms

      socket.emit('connect')
      socketMock.expects('write').once()

      client.readCoils(10, 11)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (e) {
          assert.equal('Timeout', e.err)
          socketMock.verify()
          done()
        })
    })
    it('should handle a valid request while offline', function (done) {
      let client = new Modbus.client.TCP(socket)

      client.readCoils(10, 11)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (e) {
          assert.equal('Offline', e.err)
          done()
        })
    })
    it('should handle two valid request while offline', function (done) {
      let client = new Modbus.client.TCP(socket)

      client.readCoils(10, 11)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (e) {
          assert.equal('Offline', e.err)
        })
      client.readCoils(11, 12)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (e) {
          assert.equal('Offline', e.err)
          done()
        })
    })

    it('should handle two valid requests', function (done) {
      let client = new Modbus.client.TCP(socket)
      let responseA = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x05, // byte count
        0x01,       // unit id
        0x01,       // function code
        0x02,       // byte count
        0xdd,       // coils
        0x00
      ])
      let responseB = Buffer.from([
        0x00, 0x02, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x05, // byte count
        0x01,       // unit id
        0x01,       // function code
        0x02,       // byte count
        0xdd,       // coils
        0x00
      ])

      socket.emit('connect')
      socketMock.expects('write').twice()

      client.readCoils(10, 11)
        .then(function (resp) {
          assert.ok(true)
          socket.emit('data', responseB)
        }).catch(function (e) {
          assert.ok(false)
        })
      client.readCoils(11, 12)
        .then(function (resp) {
          assert.ok(true)
          done()
        }).catch(function (e) {
          assert.ok(false)
        })

      socket.emit('data', responseA)
    })
    it('should handle a valid request with an out of sync response', function (done) {
      let client = new Modbus.client.TCP(socket)
      let response = Buffer.from([
        0x00, 0x02, // transaction id is WRONG!!!!
        0x00, 0x00, // protocol
        0x00, 0x05, // byte count
        0x01,       // unit id
        0x01,       // function code
        0x02,       // byte count
        0xdd,       // coils
        0x00
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.readCoils(10, 11)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (e) {
          assert.equal('OutOfSync', e.err)
          socketMock.verify()
          done()
        })

      socket.emit('data', response)
    })
    it('should handle two valid request with an out of sync response', function (done) {
      let client = new Modbus.client.TCP(socket)
      let response = Buffer.from([
        0x00, 0x02, // transaction id is WRONG!!!!
        0x00, 0x00, // protocol
        0x00, 0x05, // byte count
        0x01,       // unit id
        0x01,       // function code
        0x02,       // byte count
        0xdd,       // coils
        0x00
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.readCoils(10, 11)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (e) {
          assert.equal('OutOfSync', e.err)
        })

      client.readCoils(12, 13)
        .then(function () {
          assert.ok(false)
        }).catch(function (e) {
          assert.equal('OutOfSync', e.err)
          socketMock.verify()
          done()
        })

      socket.emit('data', response)
    })
    it('should handle a valid request with an out of sync response (wrong fc)', function (done) {
      let client = new Modbus.client.TCP(socket)
      let response = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x05, // byte count
        0x01,       // unit id
        0x02,       // function code WRONG!!!
        0x02,       // byte count
        0xdd,       // coils
        0x00
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.readCoils(10, 11)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (e) {
          assert.equal('OutOfSync', e.err)
          socketMock.verify()
          done()
        })

      socket.emit('data', response)
    })
    it('should handle a valid request with a wrong protocol response', function (done) {
      let client = new Modbus.client.TCP(socket)
      let response = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x01, // protocol WRONG !!!!
        0x00, 0x05, // byte count
        0x01,       // unit id
        0x01,       // function code
        0x02,       // byte count
        0xdd,       // coils
        0x00
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.readCoils(10, 11)
        .then(function (resp) {
          assert.ok(false)
          done()
        }).catch(function (e) {
          assert.equal('Protocol', e.err)
          socketMock.verify()
          done()
        })

      socket.emit('data', response)
    })
  })
  describe('Read Discrete Inputs Tests.', function () {
    it('should handle a valid request', function (done) {
      let client = new Modbus.client.TCP(socket, 2)
      let response = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x05, // byte count
        0x02,       // unit id
        0x02,       // function code
        0x02,       // byte count
        0xdd,       // coils
        0x00
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.readDiscreteInputs(10, 11)
        .then(function (resp) {
          assert.ok(resp.response)
          assert.ok(resp.request)

          socketMock.verify()

          done()
        }).catch(function (error) {
          console.error(error)
        })

      socket.emit('data', response)
    })
    it('should handle a invalid request (invalid start address)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.readDiscreteInputs(0xFFFF01, 11)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidStartAddress', error.err)
          socketMock.verify()
          done()
        })
    })
    it('should handle a invalid request (invalid quantity)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.readDiscreteInputs(10, 0x7D01)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (e) {
          assert.equal('InvalidQuantity', e.err)
          socketMock.verify()
          done()
        })
    })
  })
  describe('Read Holding Registers Tests.', function () {
    it('should handle a valid request', function (done) {
      let client = new Modbus.client.TCP(socket, 2)
      let response = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x07, // byte count
        0x02,       // unit id
        0x03,       // function code
        0x04,       // byte count
        0x43, 0x21, // registers
        0x12, 0x34
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.readHoldingRegisters(2, 2)
        .then(function (resp) {
          assert.ok(resp.response)
          assert.ok(resp.request)

          socketMock.verify()

          done()
        }).catch(function (error) {
          console.error(error)
        })

      socket.emit('data', response)
    })
    it('should handle a invalid request (invalid start address)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.readHoldingRegisters(0xFFFF01, 11)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidStartAddress', error.err)
          socketMock.verify()
          done()
        })
    })
    it('should handle a invalid request (invalid quantity)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.readHoldingRegisters(10, 0x7D01)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (e) {
          assert.equal('InvalidQuantity', e.err)
          socketMock.verify()
          done()
        })
    })
  })
  describe('Read Input Registers Tests.', function () {
    it('should handle a valid request', function (done) {
      let client = new Modbus.client.TCP(socket, 2)
      let response = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x07, // byte count
        0x02,       // unit id
        0x04,       // function code
        0x04,       // byte count
        0x43, 0x21, // registers
        0x12, 0x34
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.readInputRegisters(2, 2)
        .then(function (resp) {
          assert.ok(resp.response)
          assert.ok(resp.request)

          socketMock.verify()

          done()
        }).catch(function (error) {
          console.error(error)
        })

      socket.emit('data', response)
    })
    it('should handle a invalid request (invalid start address)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.readInputRegisters(0xFFFF01, 11)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidStartAddress', error.err)
          socketMock.verify()
          done()
        })
    })
    it('should handle a invalid request (invalid quantity)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.readInputRegisters(10, 0x7D01)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (e) {
          assert.equal('InvalidQuantity', e.err)
          socketMock.verify()
          done()
        })
    })
  })
  describe('Write Single Coil Tests.', function () {
    it('should handle a valid request', function (done) {
      let client = new Modbus.client.TCP(socket, 2)
      let response = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x05,       // function code
        0x12, 0x34, // output address
        0xFF, 0x00  // output value
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.writeSingleCoil(2, true)
        .then(function (resp) {
          assert.ok(resp.response)
          assert.ok(resp.request)

          socketMock.verify()

          done()
        }).catch(function (error) {
          console.error(error)
        })

      socket.emit('data', response)
    })
    it('should handle a invalid request (invalid start address)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.writeSingleCoil(0xFFFF01, false)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidStartAddress', error.err)
          socketMock.verify()
          done()
        })
    })
  })
  describe('Write Single Register Tests.', function () {
    it('should handle a valid request', function (done) {
      let client = new Modbus.client.TCP(socket, 2)
      let response = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x06,       // function code
        0x12, 0x34, // output address
        0x43, 0x21  // output value
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.writeSingleRegister(0x1234, 0x4321)
        .then(function (resp) {
          assert.ok(resp.response)
          assert.ok(resp.request)

          socketMock.verify()

          done()
        }).catch(function (error) {
          console.error(error)
        })

      socket.emit('data', response)
    })
    it('should handle a invalid request (invalid start address)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.writeSingleRegister(0xFFFF01, 0x4321)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidStartAddress', error.err)
          socketMock.verify()
          done()
        })
    })
    it('should handle a invalid request (invalid value, to big)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.writeSingleRegister(0x1234, 0x12345)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidValue', error.err)
          socketMock.verify()
          done()
        })
    })
    it('should handle a invalid request (invalid value, float)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.writeSingleRegister(0x1234, Math.PI)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidValue', error.err)
          socketMock.verify()
          done()
        })
    })
    it('should handle a invalid request (invalid value, negative)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.writeSingleRegister(0x1234, -123)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidValue', error.err)
          socketMock.verify()
          done()
        })
    })
  })
  describe('Write Multiple Coils Tests.', function () {
    it('should handle a valid request (with array)', function (done) {
      let client = new Modbus.client.TCP(socket, 2)
      let response = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x0F,       // function code
        0x12, 0x34, // starting address
        0x00, 0x08  // quantity of outputs
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.writeMultipleCoils(0x1234, [1, 0, 1, 1, 0, 1, 1, 1])
        .then(function (resp) {
          assert.ok(resp.response)
          assert.ok(resp.request)

          socketMock.verify()

          done()
        }).catch(function (error) {
          console.error(error)
        })

      socket.emit('data', response)
    })
    it('should handle a valid request (with buffer)', function (done) {
      let client = new Modbus.client.TCP(socket, 2)
      let response = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x0F,       // function code
        0x12, 0x34, // starting address
        0x00, 0x08  // quantity of outputs
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.writeMultipleCoils(0x1234, Buffer.from([0x7b]))
        .then(function (resp) {
          assert.ok(resp.response)
          assert.ok(resp.request)

          socketMock.verify()

          done()
        }).catch(function (error) {
          console.error(error)
        })

      socket.emit('data', response)
    })

    it('should handle a invalid request (invalid start address)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.writeMultipleCoils(0xFFFF01, [0, 1, 0, 1, 0, 1, 0, 1, 0, 1])
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidStartAddress', error.err)
          socketMock.verify()
          done()
        })
    })
    it('should handle a invalid request (invalid array size)', function (done) {
      let client = new Modbus.client.TCP(socket)
      let arr = []

      for (let i = 0; i < (0x07b0 * 8) + 1; i += 1) {
        arr.push(1)
      }

      socket.emit('connect')
      socketMock.expects('write').never()

      client.writeMultipleCoils(0x0, arr)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidArraySize', error.err)
          socketMock.verify()
          done()
        })
    })
    it('should handle a invalid request (invalid buffer size)', function (done) {
      let client = new Modbus.client.TCP(socket)
      let buf = Buffer.alloc(0x07b1)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.writeMultipleCoils(0x0, buf)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidBufferSize', error.err)
          socketMock.verify()
          done()
        })
    })
    it('should handle a invalid request (inconsistent buffer size)', function (done) {
      let client = new Modbus.client.TCP(socket)
      let buf = Buffer.alloc(0x07a0 / 8)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.writeMultipleCoils(0x0, buf, 0x7b0)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidBufferSize', error.err)
          socketMock.verify()
          done()
        })
    })
  })
  describe('Write Multiple Registers Tests.', function () {
    it('should handle a valid request (with array)', function (done) {
      let client = new Modbus.client.TCP(socket, 2)
      let response = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x10,       // function code
        0x12, 0x34, // starting address
        0x00, 0x10  // quantity of outputs
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.writeMultipleRegisters(0x1234, [0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008])
        .then(function (resp) {
          assert.ok(resp.response)
          assert.ok(resp.request)

          socketMock.verify()

          done()
        }).catch(function (error) {
          console.error(error)
        })

      socket.emit('data', response)
    })
    it('should handle a valid request (with buffer)', function (done) {
      let client = new Modbus.client.TCP(socket, 2)
      let response = Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x06, // byte count
        0x02,       // unit id
        0x10,       // function code
        0x12, 0x34, // starting address
        0x00, 0x10  // quantity of outputs
      ])

      socket.emit('connect')
      socketMock.expects('write').once()

      client.writeMultipleRegisters(0x1234, Buffer.from([0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x00, 0x04, 0x00, 0x05, 0x00, 0x06, 0x00, 0x07, 0x00, 0x08]))
        .then(function (resp) {
          assert.ok(resp.response)
          assert.ok(resp.request)

          socketMock.verify()

          done()
        }).catch(function (error) {
          console.error(error)
        })

      socket.emit('data', response)
    })

    it('should handle a invalid request (invalid start address)', function (done) {
      let client = new Modbus.client.TCP(socket)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.writeMultipleRegisters(0xFFFF01, [])
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidStartAddress', error.err)
          socketMock.verify()
          done()
        })
    })
    it('should handle a invalid request (invalid array size)', function (done) {
      let client = new Modbus.client.TCP(socket)
      let arr = []

      for (let i = 0; i < (0x007b + 1); i += 1) {
        arr.push(i)
      }

      socket.emit('connect')
      socketMock.expects('write').never()

      client.writeMultipleRegisters(0x0, arr)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidArraySize', error.err)
          socketMock.verify()
          done()
        })
    })
    it('should handle a invalid request (invalid buffer size)', function (done) {
      let client = new Modbus.client.TCP(socket)
      let buf = Buffer.alloc((0x007b * 2) + 1)

      socket.emit('connect')
      socketMock.expects('write').never()

      client.writeMultipleRegisters(0x0, buf)
        .then(function (resp) {
          assert.ok(false)
        }).catch(function (error) {
          assert.equal('InvalidBufferSize', error.err)
          socketMock.verify()
          done()
        })
    })
  })
  */
})
