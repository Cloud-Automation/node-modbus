'use strict'

let debug = require('debug')('buffer-utils')

// Buffer utilities to make simplify writing multiple coils
/*
* Outputs to set might be a long buffer starting mid way through a byte.
* For example, outputs [0b11111111, 0b11111111, 0b11111111] starting at coil 5
* Original Coils:  [0b00000010, 0b00000000, 0b00000000, 0b11111111]
* Outputs shifted: [0b11110000, 0b11111111, 0b11111111, 0b00001111]
* Resultant Coils: [0b11110010, 0b11111111, 0b11111111, 0b11111111]
* The resultant coils are set to shifted outputs, but special attention needs to
* be paid to the first and last bytes.
*
* This code is broken up into 3 funtions:
*       bufferShift
*       firstByte
*       lastByte
*/

/** bufferShift shift a buffer of ouputs so they can be used to overwrite existing coils
* @param {start_address} first coil to write
* @param {end_address} last coil to write
* @param {outputs} buffer of outputs to write
* @returns shifted output buffer
*/

class BufferUtils {

    static bufferShift(start_address, end_address, outputs) {
      start_address = start_address - 1
      let start_shift = start_address % 8
      let start_byte = Math.floor(start_address / 8)
      let end_byte = Math.floor(end_address / 8)

      let size = end_byte - start_byte + 1
      let remainder = 8 - start_shift

      // Define a new buffer
      let buffer = Buffer.allocUnsafe(size)

      buffer[0] = outputs[0] << start_shift
      debug('buffer[0] = %s ( %s << %d )', buffer[0].toString(2), outputs[0].toString(2), start_shift)

      let padded_buffer = Buffer.concat([outputs, Buffer.alloc(1)], outputs.length + 1)

      for (let i = 1; i < size; i++) {
          buffer[i] = (padded_buffer[i] << start_shift) + (padded_buffer[i - 1] >> (8 - start_shift))
          debug('buffer[%d] = %s ( %s << %d + %s >> %d)',
                        i,
                        buffer[i].toString(2),
                        padded_buffer[i].toString(2),
                        start_shift,
                        padded_buffer[i-1].toString(2),
                        8 - start_address
                    )
      }

      return buffer
    }

    /** firstByte ensure first byte is set correctly
    * @param {start_address} first coil to write
    * @param {origianl_byte} byte from the original coils buffer
    * @param {output_byte} first byte from the shifted outputs buffer
    * @returns correct first byte to be written to coils buffer
    */
    static firstByte(start_address, original_byte, output_byte) {
        start_address = start_address - 1
        let start_shift = start_address % 8
        let mask = 0xff >> (8 - start_shift)
        let masked_original_byte = original_byte & mask

        let first_byte = output_byte + masked_original_byte

        return first_byte
    }

    /** lastByte ensure last byte is set correctly
    * @param {end_address} last coil to write
    * @param {origianl_byte} byte from the original coils buffer
    * @param {output_byte} last byte from the shifted outputs buffer
    * @returns correct last byte to be written to coils buffer
    */
    static lastByte(end_address, original_byte, output_byte) {
        let end_shift = end_address % 8
        let mask = 0xff << end_shift
        let masked_original_byte = original_byte & mask

        let last_byte = output_byte + masked_original_byte

        return last_byte
    }
}

module.exports = BufferUtils
