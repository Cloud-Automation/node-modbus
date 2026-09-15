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
      0xE0, 0xAC // crc
    ])

    handler.handleData(responseBuffer)

    const response = handler.shift()

    assert.ok(response !== null)
    assert.equal(1, response.address)
    assert.equal(1, response.body.fc)
    assert.equal(0xACE0, response.crc)
    assert.equal(false, response.corrupted)
    assert.equal(7, response.byteCount)

    assert.equal(1, response.body.fc)
    assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
  })
  it('should handle a exception', function () {
    const responseBuffer = Buffer.from([
      0x01,       // address
      0x81,       // exception code for fc 0x01
      0x01,       // exception code ILLEGAL FUNCTION
      0x81, 0x90  // crc
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
      0xE0, 0xAC  // crc
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

  /* Modbus/RTU carries no framing in the payload, so line noise or a frame the device never
   * completed stays in front of every following response: the buffer only ever advances when a
   * complete response parses and every frame is read from offset 0. The CRC is the only
   * evidence that a frame really starts where the parser is looking.
   */
  describe('resynchronizing an unparsable buffer', function () {
    /* Address, function code 0x03 and a byte count of 250: a perfectly plausible start that the
     * device never finished. The function code is real, so nothing but the buffer limit can
     * prove these bytes will never become a frame.
     */
    const stalledFrame = Buffer.from([0x01, 0x03, 0xfa])

    const readCoilsResponse = function () {
      return Buffer.from([
        0x01,       // address
        0x01,       // function code
        0x02,       // byte count
        0xdd,       // coils
        0x00,
        0xE0, 0xAC  // crc
      ])
    }

    /* 2 registers, 0x000A and 0x0014 */
    const readHoldingRegistersResponse = function () {
      return Buffer.from([
        0x01,       // address
        0x03,       // function code
        0x04,       // byte count
        0x00, 0x0A, // register 0
        0x00, 0x14, // register 1
        0xDA, 0x3E  // crc
      ])
    }

    it('should default to the largest possible Modbus/RTU ADU', function () {
      assert.equal(256, new ModbusRTUClientResponseHandler().maxBufferSize)
      assert.equal(64, new ModbusRTUClientResponseHandler(64).maxBufferSize)
    })

    /* Without the CRC check a single stray byte turns this read holding registers answer into a
     * read coils answer with invented values, and the handler hands it to the caller as a
     * genuine reading - a wrong measurement is far worse than a timeout.
     */
    it('should not deliver a misaligned frame as a valid response', function () {
      handler.handleData(Buffer.concat([
        Buffer.from([0x01]), // a stray byte in front of an otherwise intact frame
        readHoldingRegistersResponse()
      ]))

      const response = handler.shift()

      assert.ok(response !== undefined, 'the handler did not resynchronize')
      assert.equal(3, response.body.fc, 'the misaligned read coils parse must not be delivered')
      assert.equal(1, response.address)
      assert.deepEqual([10, 20], response.body.valuesAsArray)
      assert.equal(undefined, handler.shift(), 'only one response may be delivered')
    })

    it('should resynchronize within the same chunk the stray bytes arrive in', function () {
      handler.handleData(Buffer.concat([
        Buffer.from([0xff, 0xff]),
        readCoilsResponse()
      ]))

      const response = handler.shift()

      assert.ok(response !== undefined, 'the frame after the noise must still be found')
      assert.equal(1, response.body.fc)
      assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
    })

    it('should drop a frame whose crc does not verify', function () {
      const corrupt = readCoilsResponse()
      corrupt[3] = 0xab // flip a coil byte, leaving the crc stale

      handler.handleData(corrupt)

      assert.equal(undefined, handler.shift(), 'a crc failure must never reach the caller')
    })

    /* A frame that stalled behind a valid function code carries no crc to check yet and no
     * length to measure, so Modbus/RTU still needs the buffer limit as its backstop.
     */
    it('should discard the buffer when no response parses from more than maxBufferSize bytes', function () {
      handler = new ModbusRTUClientResponseHandler(12)

      handler.handleData(stalledFrame)
      assert.equal(undefined, handler.shift(), 'an unfinished frame must not parse')

      /* 10 bytes, below the limit, the stalled frame keeps this response from parsing */
      handler.handleData(readCoilsResponse())
      assert.equal(undefined, handler.shift(), 'the stalled frame must desync this response')

      /* 17 bytes, beyond the limit, the prefix provably is not the start of a frame */
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
      handler.handleData(stalledFrame)

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
