import { EventEmitter } from 'events'
import ModbusServerClient from './modbus-server-client';
import { BooleanArray } from './constants';
import { Socket } from 'net';


export interface ModbusServerOptions {
  coils: Buffer;
  discrete: Buffer;
  holding: Buffer;
  input: Buffer;
}

const DEFAULT_MODBUS_SERVER_OPTIONS: ModbusServerOptions = {
  coils: Buffer.alloc(1024),
  discrete: Buffer.alloc(1024),
  holding: Buffer.alloc(1024),
  input: Buffer.alloc(1024),
}

export type BufferCallback = (buffer: Buffer) => void;

export default class ModbusServer extends EventEmitter {
  private _options: ModbusServerOptions;
  private get _coils() {
    return this._options.coils;
  }
  private get _discrete() {
    return this._options.discrete;
  }
  private get _holding() {
    return this._options.holding;
  }
  private get _input() {
    return this._options.input;
  }

  constructor(options: Partial<ModbusServerOptions> = DEFAULT_MODBUS_SERVER_OPTIONS) {
    super()

    this._options = {
      ...DEFAULT_MODBUS_SERVER_OPTIONS,
      ...options,
    }
  }

  get coils() {
    return this._coils
  }

  get discrete() {
    return this._discrete
  }

  get holding() {
    return this._holding
  }

  get input() {
    return this._input
  }

  on(event: 'connection', listener: (socket: Socket) => void): this
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  emit(event: 'connection', client: ModbusServerClient<any, any, any>): boolean
  emit(event: 'readCoils', request: any, cb: BufferCallback): boolean
  emit(event: 'preReadCoils', request: any, cb: BufferCallback): boolean
  emit(event: 'postReadCoils', request: any, cb: BufferCallback): boolean
  emit(event: 'readDiscreteInputs', request: any, cb: BufferCallback): boolean
  emit(event: 'preReadDiscreteInputs', request: any, cb: BufferCallback): boolean
  emit(event: 'postReadDiscreteInputs', request: any, cb: BufferCallback): boolean
  emit(event: 'readHoldingRegisters', request: any, cb: BufferCallback): boolean
  emit(event: 'preReadHoldingRegisters', request: any, cb: BufferCallback): boolean
  emit(event: 'postReadHoldingRegisters', request: any, cb: BufferCallback): boolean
  emit(event: 'readInputRegisters', request: any, cb: BufferCallback): boolean
  emit(event: 'preReadInputRegisters', request: any, cb: BufferCallback): boolean
  emit(event: 'postReadInputRegisters', request: any, cb: BufferCallback): boolean
  emit(event: 'writeSingleCoil', request: any, cb: BufferCallback): boolean
  emit(event: 'preWriteSingleCoil', request: any, cb: BufferCallback): boolean
  emit(event: 'postWriteSingleCoil', request: any, cb: BufferCallback): boolean
  emit(event: 'writeSingleRegister', request: any, cb: BufferCallback): boolean
  emit(event: 'preWriteSingleRegister', request: any, cb: BufferCallback): boolean
  emit(event: 'postWriteSingleRegister', request: any, cb: BufferCallback): boolean
  emit(event: 'writeMultipleCoils', request: any, cb: BufferCallback): boolean
  emit(event: 'preWriteMultipleCoils', request: any, cb: BufferCallback): boolean
  emit(event: 'writeMultipleCoils', coils: Buffer, oldStatus: BooleanArray): boolean
  emit(event: 'postWriteMultipleCoils', coils: Buffer, newStatus: BooleanArray): boolean
  emit(event: 'postWriteMultipleCoils', request: any, cb: BufferCallback): boolean
  emit(event: 'writeMultipleRegisters', request: any, cb: BufferCallback): boolean
  emit(event: 'preWriteMultipleRegisters', request: any, cb: BufferCallback): boolean
  emit(event: 'writeMultipleRegisters', holdingRegisters: Buffer): boolean
  emit(event: 'postWriteMultipleRegisters', holdingRegisters: Buffer): boolean
  emit(event: 'postWriteMultipleRegisters', request: any, cb: BufferCallback): boolean
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }


}