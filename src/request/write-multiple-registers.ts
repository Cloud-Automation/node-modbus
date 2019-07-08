import { FC } from "../codes";

import ModbusRequestBody from './request-body.js'

/** Write Multiple Registers Request Body
 * @extends ModbusRequestBody
 */
export default class WriteMultipleRegistersRequestBody extends ModbusRequestBody {
  private _address: number;
  private _values: number[] | Buffer;
  private _byteCount!: number;
  private _numberOfBytes!: number;
  private _quantity!: number;
  private _valuesAsBuffer!: Buffer;
  private _valuesAsArray!: number[];

  static fromBuffer(buffer: Buffer) {
    try {
      const fc = buffer.readUInt8(0)
      const address = buffer.readUInt16BE(1)
      const numberOfBytes = buffer.readUInt8(5)
      const values = buffer.slice(6, 6 + numberOfBytes)

      if (fc !== FC.WRITE_MULTIPLE_HOLDING_REGISTERS) {
        return null
      }

      return new WriteMultipleRegistersRequestBody(address, values)
    } catch (e) {
      return null
    }
  }

  /** Create a new Write Multiple Registers Request Body.
   * @param {number} address Write address.
   * @param {number[] | Buffer} values Values to be written. Either a Array of UInt16 values or a Buffer.
   * @param {number} quantity In case of values being a Buffer, specify the number of coils that needs to be written.
   * @throws {InvalidStartAddressException} When address is larger than 0xFFFF.
   * @throws {InvalidArraySizeException}
   * @throws {InvalidBufferSizeException}
   */
  constructor(address: number, values: number[] | Buffer) {
    super(FC.WRITE_MULTIPLE_HOLDING_REGISTERS)
    if (address > 0xFFFF) {
      throw new Error('InvalidStartAddress')
    }
    if (Array.isArray(values) && values.length > 0x7b) {
      throw new Error('InvalidArraySize')
    }
    if (values instanceof Buffer && values.length > 0x7b * 2) {
      throw new Error('InvalidBufferSize')
    }
    this._address = address
    this._values = values

    if (this._values instanceof Buffer) {
      this._byteCount = Math.min(this._values.length + 6, 0xF6)
      this._numberOfBytes = this._values.length
      this._quantity = Math.floor(this._values.length / 2)
      this._valuesAsBuffer = this._values
      this._valuesAsArray = []
      for (let i = 0; i < this._values.length; i += 2) {
        this._valuesAsArray.push(this._values.readUInt16BE(i))
      }
    }

    if (this._values instanceof Array) {
      this._byteCount = Math.min(this._values.length * 2 + 6, 0xF6)
      this._numberOfBytes = Math.floor(this._values.length * 2)
      this._quantity = this._values.length
      this._valuesAsBuffer = Buffer.alloc(this._numberOfBytes)
      this._values.forEach((v, i) => {
        this._valuesAsBuffer.writeUInt16BE(v, i * 2)
      })
    }
  }

  /** Start Address to begin writing data */
  get address() {
    return this._address
  }

  /** Quantity of registers beein written */
  get quantity() {
    return this._quantity
  }

  get count() {
    return this.quantity
  }

  /** Values to be written */
  get values() {
    return this._values
  }

  get valuesAsArray() {
    return this._valuesAsArray
  }

  get valuesAsBuffer() {
    return this._valuesAsBuffer
  }

  get byteCount() {
    return this._byteCount
  }

  get numberOfBytes() {
    return this._numberOfBytes
  }

  get name() {
    return 'WriteMultipleRegisters' as const
  }

  createPayload() {
    const payload = Buffer.alloc(6 + this._numberOfBytes)
    payload.writeUInt8(this._fc, 0) // function code
    payload.writeUInt16BE(this._address, 1) // start address
    payload.writeUInt16BE(this._quantity, 3)
    payload.writeUInt8(this._numberOfBytes, 5)
    this._valuesAsBuffer.copy(payload, 6)
    return payload
  }
}

export function isWriteMultipleRegistersRequestBody(x: any): x is WriteMultipleRegistersRequestBody {
  if (x instanceof WriteMultipleRegistersRequestBody) {
    return true;
  } else {
    return false;
  }
}