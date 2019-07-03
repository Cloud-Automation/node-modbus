

import { Byte, BooleanArray } from "./constants";

const debug = require('debug')('buffer-utils')

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
  static bufferShift(startAddress: number, endAddress: number, outputs: Buffer) {
    startAddress = startAddress - 1
    const startShift = startAddress % 8
    const startByte = Math.floor(startAddress / 8)
    const endByte = Math.floor(endAddress / 8)

    const size = endByte - startByte + 1

    // Define a new buffer
    const buffer = Buffer.allocUnsafe(size)

    buffer[0] = outputs[0] << startShift
    debug('buffer[0] = %s ( %s << %d )', buffer[0].toString(2), outputs[0].toString(2), startShift)

    const paddedBuffer = Buffer.concat([outputs, Buffer.alloc(1)], outputs.length + 1)

    for (let i = 1; i < size; i++) {
      buffer[i] = (paddedBuffer[i] << startShift) + (paddedBuffer[i - 1] >> (8 - startShift))
      debug('buffer[%d] = %s ( %s << %d + %s >> %d)',
        i,
        buffer[i].toString(2),
        paddedBuffer[i].toString(2),
        startShift,
        paddedBuffer[i - 1].toString(2),
        8 - startAddress
      )
    }

    return buffer
  }

  /** firstByte ensure first byte is set correctly
   * @param {Byte} startAddress coil to write
   * @param {Byte} originalByte from the original coils buffer
   * @param {Byte} outputByte byte from the shifted outputs buffer
   * @returns correct first byte to be written to coils buffer
   */
  static firstByte(startAddress: Byte, originalByte: Byte, outputByte: Byte): number {
    startAddress = startAddress - 1
    const startShift = startAddress % 8
    const mask = 0xff >> (8 - startShift)
    const maskedOriginalByte = originalByte & mask

    return outputByte + maskedOriginalByte
  }

  /** lastByte ensure last byte is set correctly
   * @param {number} last coil to write
   * @param {Byte} byte from the original coils buffer
   * @param {Byte} last byte from the shifted outputs buffer
   * @returns {number} correct last byte to be written to coils buffer
   */
  static lastByte(endAddress: number, originalByte: Byte, outputByte: Byte): number {
    const endShift = endAddress % 8
    const mask = 0xff << endShift
    const maskedOriginalByte = originalByte & mask

    return outputByte + maskedOriginalByte
  }

  static bufferToArrayStatus(buffer: Buffer): BooleanArray {
    const statusArray: BooleanArray = []
    let pos: number, curByteIdx: number, curByte: Byte
    if (!(buffer instanceof Buffer)) {
      return statusArray
    }

    for (let i = 0; i < buffer.length * 8; i += 1) {
      pos = i % 8
      curByteIdx = Math.floor(i / 8)
      curByte = buffer.readUInt8(curByteIdx)
      const value = ((curByte & Math.pow(2, pos)) > 0);
      statusArray.push(value ? 1 : 0);
    }

    return statusArray
  }

  static arrayStatusToBuffer(array: BooleanArray) {
    const byteCount = array instanceof Array ? Math.ceil(array.length / 8) : 0
    const buffer = Buffer.alloc(byteCount)

    if (!(array instanceof Array)) {
      return buffer
    }

    let byteOffset, bitOffset, byte
    for (let i = 0; i < array.length; i += 1) {
      byteOffset = Math.floor(i / 8)
      bitOffset = i % 8
      byte = buffer.readUInt8(byteOffset)
      byte += array[i] ? Math.pow(2, bitOffset) : 0
      buffer.writeUInt8(byte, byteOffset)
    }

    return buffer
  }
}

export = BufferUtils
