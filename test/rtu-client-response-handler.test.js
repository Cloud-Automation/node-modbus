'use strict'

/* global describe, it, beforeEach */

const assert = require('assert')
const ModbusRTUClientResponseHandler = require('../dist/rtu-client-response-handler.js').default

describe('Modbus/RTU Client Response Tests', function () {
  let handler

  beforeEach(function () {
    handler = new ModbusRTUClientResponseHandler()
  })

  /* we are using the read coils function to test rtu specifics */
  it('should handle a valid read coils response', function () {
    const responseBuffer = Buffer.from([
      0x01,       // address
      0x01,       // function code
      0x02,       // byte count
      0xdd,       // coils
      0x00,
      0xCD, 0xAB // crc
    ])

    handler.handleData(responseBuffer)

    const response = handler.shift()

    assert.ok(response !== null)
    assert.equal(1, response.address)
    assert.equal(1, response.body.fc)
    assert.equal(0xABCD, response.crc)
    assert.equal(7, response.byteCount)

    assert.equal(1, response.body.fc)
    assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
  })
  it('should handle a exception', function () {
    const responseBuffer = Buffer.from([
      0x01,       // address
      0x81,       // exception code for fc 0x01
      0x01,       // exception code ILLEGAL FUNCTION
      0x00, 0x00  // crc
    ])

    handler.handleData(responseBuffer)

    const response = handler.shift()

    assert.ok(response !== undefined)
    assert.equal(0x01, response.address)
    assert.equal(0x01, response.body.fc)
    assert.equal(0x01, response.body.code)
    assert.equal('ILLEGAL FUNCTION', response.body.message)
  })
  it('should handle a chopped response', function () {
    const responseBufferA = Buffer.from([
      0x01       // address
    ])
    const responseBufferB = Buffer.from([
      0x01,       // function code
      0x02,       // byte count
      0xdd,       // coils
      0x00,
      0x00, 0x00  // crc
    ])

    handler.handleData(responseBufferA)

    let response = handler.shift()

    assert.ok(response === undefined)

    handler.handleData(responseBufferB)

    response = handler.shift()

    assert.ok(response !== undefined)
    assert.equal(1, response.address)
    assert.equal(1, response.body.fc)
    assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
  })

  /* Modbus/RTU has no framing in the payload at all, so line noise or a frame the device
   * never completed stays in front of every following response. The buffer only ever advances
   * when a complete response parses and every frame is read from offset 0.
   */
  describe('resynchronizing an unparsable buffer', function () {
    /* function code 0x00 does not exist, so this never parses into a response body */
    const noise = Buffer.from([0x00, 0x00, 0x00, 0x00])

    const readCoilsResponse = function () {
      return Buffer.from([
        0x01,       // address
        0x01,       // function code
        0x02,       // byte count
        0xdd,       // coils
        0x00,
        0xCD, 0xAB  // crc
      ])
    }

    it('should default to the largest possible Modbus/RTU ADU', function () {
      assert.equal(256, new ModbusRTUClientResponseHandler().maxBufferSize)
      assert.equal(64, new ModbusRTUClientResponseHandler(64).maxBufferSize)
    })

    it('should discard the buffer when no response parses from more than maxBufferSize bytes', function () {
      handler = new ModbusRTUClientResponseHandler(12)

      handler.handleData(noise)
      assert.equal(undefined, handler.shift(), 'noise must not parse into a response')

      /* 11 bytes, below the limit, the noise keeps this response from parsing */
      handler.handleData(readCoilsResponse())
      assert.equal(undefined, handler.shift(), 'the leading noise must desync this response')

      /* 18 bytes, beyond the limit, the prefix provably is not the start of a frame */
      handler.handleData(readCoilsResponse())
      assert.equal(undefined, handler.shift())

      /* the buffer was dropped, so this response is aligned again */
      handler.handleData(readCoilsResponse())

      const response = handler.shift()

      assert.ok(response !== undefined, 'the handler did not resynchronize')
      assert.equal(1, response.address)
      assert.equal(1, response.body.fc)
      assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
    })

    it('should keep a response that is still being received', function () {
      /* room for exactly one ADU, so the incomplete frame sits right at the limit */
      handler = new ModbusRTUClientResponseHandler(7)
      const responseBuffer = readCoilsResponse()

      handler.handleData(responseBuffer.slice(0, 4))
      assert.equal(undefined, handler.shift())

      handler.handleData(responseBuffer.slice(4))

      const response = handler.shift()

      assert.ok(response !== undefined, 'a frame at the limit must not be discarded')
      assert.equal(1, response.body.fc)
    })

    it('should resynchronize with the default limit as well', function () {
      handler.handleData(noise)

      let response
      for (let i = 0; i < 45 && response === undefined; i += 1) {
        handler.handleData(readCoilsResponse())
        response = handler.shift()
      }

      assert.ok(response !== undefined, 'the handler never resynchronized')
      assert.equal(1, response.body.fc)
    })
  })
})
