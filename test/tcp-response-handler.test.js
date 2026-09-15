'use strict'

/* global describe, it, beforeEach */

const assert = require('assert')
const TCPResponseHandler = require('../dist/tcp-client-response-handler.js').default

describe('Modbus/TCP Client Response Handler Tests', function () {
  let handler

  beforeEach(function () {
    handler = new TCPResponseHandler()
  })

  /* we are using the read coils function to test the modbus/tcp specifics */

  it('should handle a valid read coils response', function () {
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x05, // byte count
      0x03,       // unit id
      0x01,       // function code
      0x02,       // byte count
      0xdd,       // coils
      0x00
    ])

    handler.handleData(responseBuffer)

    const response = handler.shift()

    assert.ok(response !== null)
    assert.equal(1, response.id)
    assert.equal(0, response.protocol)
    assert.equal(5, response.bodyLength)
    assert.equal(11, response.byteCount)
    assert.equal(3, response.unitId)
    assert.equal(1, response.body.fc)
    assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
  })
  it('should handle a valid FC43/14 read device identification response', function () {
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x0E, // byte count
      0x03,       // unit id
      0x2B,       // function code
      0x0E,       // MEI type
      0x01,       // read device id code
      0x01,       // conformity level
      0x00,       // more follows
      0x00,       // next object id
      0x01,       // number of objects
      0x00,       // object id
      0x04,       // object value length
      0x41, 0x43, 0x4D, 0x45 // object value: ACME
    ])

    handler.handleData(responseBuffer)

    const response = handler.shift()

    assert.ok(response !== undefined)
    assert.equal(0x01, response.id)
    assert.equal(0x00, response.protocol)
    assert.equal(0x0E, response.bodyLength)
    assert.equal(0x14, response.byteCount)
    assert.equal(0x03, response.unitId)
    assert.equal(0x2B, response.body.fc)
    assert.equal(0x0E, response.body.meiType)
    assert.equal(0x01, response.body.readDeviceIdCode)
    assert.equal(0x01, response.body.conformityLevel)
    assert.equal(0x01, response.body.numberOfObjects)
    assert.equal('ACME', response.body.objects[0].value.toString('ascii'))
  })
  it('should handle a exception', function () {
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x03, // byte count
      0x03,       // unit id
      0x81,       // exception code for fc 0x01
      0x01        // exception code ILLEGAL FUNCTION
    ])

    handler.handleData(responseBuffer)

    const response = handler.shift()

    assert.ok(response !== undefined)
    assert.equal(0x01, response.id)
    assert.equal(0x00, response.protocol)
    assert.equal(0x03, response.bodyLength)
    assert.equal(0x09, response.byteCount)
    assert.equal(0x03, response.unitId)
    assert.equal(0x01, response.body.fc)
    assert.equal(0x01, response.body.code)
    assert.equal('ILLEGAL FUNCTION', response.body.message)
  })
  it('should handle a FC43/14 exception with explicit MEI type', function () {
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x04, // byte count
      0x03,       // unit id
      0xAB,       // exception code for fc 0x2B
      0x0E,       // MEI type
      0x03        // exception code ILLEGAL DATA VALUE
    ])

    handler.handleData(responseBuffer)

    const response = handler.shift()

    assert.ok(response !== undefined)
    assert.equal(0x01, response.id)
    assert.equal(0x00, response.protocol)
    assert.equal(0x04, response.bodyLength)
    assert.equal(0x0A, response.byteCount)
    assert.equal(0x03, response.unitId)
    assert.equal(0x2B, response.body.fc)
    assert.equal(0x0E, response.body.meiType)
    assert.equal(0x03, response.body.code)
    assert.equal('ILLEGAL DATA VALUE', response.body.message)
  })
  it('should handle a FC43 exception without MEI type', function () {
    const responseBuffer = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x03, // byte count
      0x03,       // unit id
      0xAB,       // exception code for fc 0x2B
      0x01        // exception code ILLEGAL FUNCTION
    ])

    handler.handleData(responseBuffer)

    const response = handler.shift()

    assert.ok(response !== undefined)
    assert.equal(0x01, response.id)
    assert.equal(0x00, response.protocol)
    assert.equal(0x03, response.bodyLength)
    assert.equal(0x09, response.byteCount)
    assert.equal(0x03, response.unitId)
    assert.equal(0x2B, response.body.fc)
    assert.equal(undefined, response.body.meiType)
    assert.equal(0x01, response.body.code)
    assert.equal('ILLEGAL FUNCTION', response.body.message)
  })
  it('should handle a chopped response', function () {
    const responseBufferA = Buffer.from([
      0x00, 0x01, // transaction id
      0x00, 0x00, // protocol
      0x00, 0x05  // byte count
    ])
    const responseBufferB = Buffer.from([
      0x03,       // unit id
      0x01,       // function code
      0x02,       // byte count
      0xdd,       // coils
      0x00
    ])

      /* deliver first part */
    handler.handleData(responseBufferA)

    let response = handler.shift()

    assert.ok(response === undefined)

      /* deliver second part */
    handler.handleData(responseBufferB)

    response = handler.shift()

    assert.ok(response !== undefined)
    assert.equal(1, response.id)
    assert.equal(0, response.protocol)
    assert.equal(5, response.bodyLength)
    assert.equal(11, response.byteCount)
    assert.equal(3, response.unitId)
    assert.equal(1, response.body.fc)
    assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
  })

  /* A device that answers with fewer bytes than its MBAP header announces, or with a frame this
   * library has no parser for, leaves a prefix in the receive buffer. The buffer only ever
   * advances when a complete response parses and every frame is read from offset 0, so that
   * prefix desyncs every following response until the handler realigns itself. Unlike a serial
   * stream, Modbus/TCP states the frame length in its header, so realigning rarely costs more
   * than the damaged frame itself.
   */
  describe('resynchronizing an unparsable buffer', function () {
    /* the beginning of a response the device never completed */
    const truncatedFrame = Buffer.from([0x00, 0x2a, 0x00, 0x00])

    const readCoilsResponse = function () {
      return Buffer.from([
        0x00, 0x01, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x05, // length
        0x03,       // unit id
        0x01,       // function code
        0x02,       // byte count
        0xdd,       // coils
        0x00
      ])
    }

    /* A complete, well formed frame carrying function code 0x11 (Report Server ID), which this
     * library has no response parser for. Its header still says exactly where it ends.
     */
    const unsupportedFunctionResponse = function () {
      return Buffer.from([
        0x00, 0x07, // transaction id
        0x00, 0x00, // protocol
        0x00, 0x04, // length
        0x03,       // unit id
        0x11,       // function code
        0x02,       // byte count
        0xaa
      ])
    }

    it('should default to the largest possible Modbus/TCP ADU', function () {
      assert.equal(260, new TCPResponseHandler().maxBufferSize)
      assert.equal(64, new TCPResponseHandler(64).maxBufferSize)
    })

    it('should skip a complete but unparsable frame in a single step', function () {
      handler.handleData(Buffer.concat([
        unsupportedFunctionResponse(),
        readCoilsResponse()
      ]))

      const response = handler.shift()

      assert.ok(response !== undefined, 'the frame behind the unparsable one must be found')
      assert.equal(1, response.id)
      assert.equal(1, response.body.fc)
      assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
    })

    it('should resynchronize as soon as the next response arrives', function () {
      handler.handleData(truncatedFrame)
      assert.equal(undefined, handler.shift(), 'a truncated frame must not parse')

      handler.handleData(readCoilsResponse())

      const response = handler.shift()

      assert.ok(response !== undefined, 'the handler did not resynchronize')
      assert.equal(1, response.id)
      assert.equal(1, response.body.fc)
      assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
    })

    /* Buffer#slice clamps silently, so without the length guard this parses into a response
     * built from bytes that never arrived.
     */
    it('should not parse a frame that announced more bytes than it sent', function () {
      const lying = readCoilsResponse()
      lying.writeUInt16BE(0x20, 4) // claim 32 bytes follow, then send 5

      handler.handleData(lying)

      assert.equal(undefined, handler.shift(), 'an incomplete frame must never reach the caller')
    })

    /* The frame has fully arrived, but the body stops short of the length the header announced,
     * which is how noise that happens to look like an MBAP header presents itself.
     */
    it('should not parse a frame whose body does not fill the announced length', function () {
      handler.handleData(Buffer.concat([
        Buffer.from([
          0x00, 0x01, // transaction id
          0x00, 0x00, // protocol
          0x00, 0x08, // length: claims a 7 byte pdu
          0x03,       // unit id
          0x01,       // function code
          0x02,       // byte count
          0xdd,       // coils
          0x00,
          0x00, 0x00, 0x00 // padding the body never accounts for
        ]),
        readCoilsResponse()
      ]))

      const response = handler.shift()

      assert.ok(response !== undefined, 'the frame behind the bad one must still be found')
      assert.equal(1, response.id, 'the short body must not be delivered')
      assert.deepEqual([1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], response.body.valuesAsArray)
      assert.equal(undefined, handler.shift(), 'only one response may be delivered')
    })

    it('should keep a response that is still being received', function () {
      /* room for exactly one ADU, so the incomplete frame sits right at the limit */
      handler = new TCPResponseHandler(11)
      const responseBuffer = readCoilsResponse()

      handler.handleData(responseBuffer.slice(0, 6))
      assert.equal(undefined, handler.shift())

      handler.handleData(responseBuffer.slice(6))

      const response = handler.shift()

      assert.ok(response !== undefined, 'a frame at the limit must not be discarded')
      assert.equal(1, response.body.fc)
    })

    /* A header that is plausible and announces a frame still on its way cannot be skipped - the
     * rest may genuinely be in flight - so the buffer limit remains the backstop for a device
     * that stops halfway through a frame it announced.
     */
    it('should discard the buffer when no response parses from more than maxBufferSize bytes', function () {
      handler = new TCPResponseHandler(20)

      /* announces 100 bytes and then stops */
      handler.handleData(Buffer.from([0x00, 0x2a, 0x00, 0x00, 0x00, 0x64, 0x03]))
      assert.equal(undefined, handler.shift(), 'a stalled frame must not parse')

      /* 18 bytes, below the limit, the stalled frame keeps this response from parsing */
      handler.handleData(readCoilsResponse())
      assert.equal(undefined, handler.shift(), 'the stalled frame must desync this response')

      /* 29 bytes, beyond the limit, so the buffer is dropped */
      handler.handleData(readCoilsResponse())
      assert.equal(undefined, handler.shift())

      /* the buffer was dropped, so this response is aligned again */
      handler.handleData(readCoilsResponse())

      const response = handler.shift()

      assert.ok(response !== undefined, 'the handler did not resynchronize')
      assert.equal(1, response.id)
      assert.equal(1, response.body.fc)
    })

    /* The cases above pin individual scenarios, but the property that actually matters is a
     * global one: wherever the stream is cut and whatever lands between frames, a response that
     * reaches the caller must be the one the device sent. The seed is fixed so a failure is
     * reproducible.
     */
    it('should never deliver a corrupted response under random noise', function () {
      let seed = 0x2f6e2b1
      const rnd = function (n) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }

      handler = new TCPResponseHandler()

      let delivered = 0

      for (let round = 0; round < 2000; round += 1) {
        if (rnd(3) === 0) {
          const noise = Buffer.alloc(1 + rnd(12))
          for (let i = 0; i < noise.length; i += 1) { noise[i] = rnd(256) }
          handler.handleData(noise)
        }

        const frame = readCoilsResponse()

        if (rnd(2) === 0) {
          const at = 1 + rnd(frame.length - 1)
          handler.handleData(frame.slice(0, at))
          handler.handleData(frame.slice(at))
        } else {
          handler.handleData(frame)
        }

        let response
        while ((response = handler.shift()) !== undefined) {
          delivered += 1
          assert.equal(1, response.body.fc, 'a response built from noise reached the caller')
          assert.deepEqual(
            [1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            response.body.valuesAsArray,
            'a response built from noise reached the caller'
          )
        }
      }

      assert.ok(delivered > 1500, `expected the handler to keep recovering, got ${delivered}`)
    })
  })
})
