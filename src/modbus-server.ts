import { EventEmitter } from 'events'
import { Socket } from 'net'
import ModbusAbstractRequest from './abstract-request'
import { BooleanArray } from './constants'
import ModbusServerClient from './modbus-server-client'

type AbstractRequest = ModbusAbstractRequest

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

export type BufferCB = (buffer: Buffer) => void

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

  public on (event: 'connection', listener: (client: ModbusServerClient<any, any, any>) => void): this
  public on (event: 'readCoils', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'preReadCoils', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'postReadCoils', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'readDiscreteInputs', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'preReadDiscreteInputs', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'postReadDiscreteInputs', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'readHoldingRegisters', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'preReadHoldingRegisters', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'postReadHoldingRegisters', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'readInputRegisters', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'preReadInputRegisters', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'postReadInputRegisters', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'writeSingleCoil', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'preWriteSingleCoil', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'postWriteSingleCoil', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'writeSingleRegister', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'preWriteSingleRegister', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'postWriteSingleRegister', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'writeMultipleCoils', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'preWriteMultipleCoils', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'writeMultipleCoils', listener: (coils: Buffer, oldStatus: BooleanArray) => void): this
  public on (event: 'postWriteMultipleCoils', listener: (coils: Buffer, newStatus: BooleanArray) => void): this
  public on (event: 'postWriteMultipleCoils', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'writeMultipleRegisters', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'preWriteMultipleRegisters', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: 'writeMultipleRegisters', listener: (holdingRegisters: Buffer) => void): this
  public on (event: 'postWriteMultipleRegisters', listener: (holdingRegisters: Buffer) => void): this
  public on (event: 'postWriteMultipleRegisters', listener: (request: AbstractRequest, cb: BufferCB) => void): this
  public on (event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener)
  }

  public emit (event: 'connection', client: ModbusServerClient<any, any, any>): boolean
  public emit (event: 'readCoils', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'preReadCoils', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'postReadCoils', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'readDiscreteInputs', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'preReadDiscreteInputs', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'postReadDiscreteInputs', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'readHoldingRegisters', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'preReadHoldingRegisters', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'postReadHoldingRegisters', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'readInputRegisters', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'preReadInputRegisters', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'postReadInputRegisters', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'writeSingleCoil', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'preWriteSingleCoil', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'postWriteSingleCoil', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'writeSingleRegister', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'preWriteSingleRegister', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'postWriteSingleRegister', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'writeMultipleCoils', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'preWriteMultipleCoils', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'writeMultipleCoils', coils: Buffer, oldStatus: BooleanArray): boolean
  public emit (event: 'postWriteMultipleCoils', coils: Buffer, newStatus: BooleanArray): boolean
  public emit (event: 'postWriteMultipleCoils', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'writeMultipleRegisters', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'preWriteMultipleRegisters', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: 'writeMultipleRegisters', holdingRegisters: Buffer): boolean
  public emit (event: 'postWriteMultipleRegisters', holdingRegisters: Buffer): boolean
  public emit (event: 'postWriteMultipleRegisters', request: AbstractRequest, cb: BufferCB): boolean
  public emit (event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args)
  }

}
