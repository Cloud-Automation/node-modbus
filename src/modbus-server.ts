import { EventEmitter } from 'events'
import { Socket } from 'net'
import { BooleanArray } from './constants'
import ModbusServerClient from './modbus-server-client'

export interface IModbusServerOptions {
  coils: Buffer
  discrete: Buffer
  holding: Buffer
  input: Buffer
}

const DEFAULT_MODBUS_SERVER_OPTIONS: IModbusServerOptions = {
  coils: Buffer.alloc(1024),
  discrete: Buffer.alloc(1024),
  holding: Buffer.alloc(1024),
  input: Buffer.alloc(1024)
}

export type BufferCallback = (buffer: Buffer) => void

export default class ModbusServer extends EventEmitter {
  private _options: IModbusServerOptions
  private get _coils () {
    return this._options.coils
  }
  private get _discrete () {
    return this._options.discrete
  }
  private get _holding () {
    return this._options.holding
  }
  private get _input () {
    return this._options.input
  }

  constructor (options: Partial<IModbusServerOptions> = DEFAULT_MODBUS_SERVER_OPTIONS) {
    super()

    this._options = {
      ...DEFAULT_MODBUS_SERVER_OPTIONS,
      ...options
    }
  }

  get coils () {
    return this._coils
  }

  get discrete () {
    return this._discrete
  }

  get holding () {
    return this._holding
  }

  get input () {
    return this._input
  }

  public on (event: 'connection', listener: (socket: Socket) => void): this
  public on (event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener)
  }

  public emit (event: 'connection', client: ModbusServerClient<any, any, any>): boolean
  public emit (event: 'readCoils', request: any, cb: BufferCallback): boolean
  public emit (event: 'preReadCoils', request: any, cb: BufferCallback): boolean
  public emit (event: 'postReadCoils', request: any, cb: BufferCallback): boolean
  public emit (event: 'readDiscreteInputs', request: any, cb: BufferCallback): boolean
  public emit (event: 'preReadDiscreteInputs', request: any, cb: BufferCallback): boolean
  public emit (event: 'postReadDiscreteInputs', request: any, cb: BufferCallback): boolean
  public emit (event: 'readHoldingRegisters', request: any, cb: BufferCallback): boolean
  public emit (event: 'preReadHoldingRegisters', request: any, cb: BufferCallback): boolean
  public emit (event: 'postReadHoldingRegisters', request: any, cb: BufferCallback): boolean
  public emit (event: 'readInputRegisters', request: any, cb: BufferCallback): boolean
  public emit (event: 'preReadInputRegisters', request: any, cb: BufferCallback): boolean
  public emit (event: 'postReadInputRegisters', request: any, cb: BufferCallback): boolean
  public emit (event: 'writeSingleCoil', request: any, cb: BufferCallback): boolean
  public emit (event: 'preWriteSingleCoil', request: any, cb: BufferCallback): boolean
  public emit (event: 'postWriteSingleCoil', request: any, cb: BufferCallback): boolean
  public emit (event: 'writeSingleRegister', request: any, cb: BufferCallback): boolean
  public emit (event: 'preWriteSingleRegister', request: any, cb: BufferCallback): boolean
  public emit (event: 'postWriteSingleRegister', request: any, cb: BufferCallback): boolean
  public emit (event: 'writeMultipleCoils', request: any, cb: BufferCallback): boolean
  public emit (event: 'preWriteMultipleCoils', request: any, cb: BufferCallback): boolean
  public emit (event: 'writeMultipleCoils', coils: Buffer, oldStatus: BooleanArray): boolean
  public emit (event: 'postWriteMultipleCoils', coils: Buffer, newStatus: BooleanArray): boolean
  public emit (event: 'postWriteMultipleCoils', request: any, cb: BufferCallback): boolean
  public emit (event: 'writeMultipleRegisters', request: any, cb: BufferCallback): boolean
  public emit (event: 'preWriteMultipleRegisters', request: any, cb: BufferCallback): boolean
  public emit (event: 'writeMultipleRegisters', holdingRegisters: Buffer): boolean
  public emit (event: 'postWriteMultipleRegisters', holdingRegisters: Buffer): boolean
  public emit (event: 'postWriteMultipleRegisters', request: any, cb: BufferCallback): boolean
  public emit (event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args)
  }

}
