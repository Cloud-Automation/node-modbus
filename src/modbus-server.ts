const EventEmitter = require('events')

class ModbusServer extends EventEmitter {
	public _options: any;
	public _coils: any;
	public _discrete: any;
	public _holding: any;
	public _input: any;

  constructor (options) {
    super()

    this._options = options || {}

    this._coils = this._options.coils || Buffer.alloc(1024)
    this._discrete = this._options.discrete || Buffer.alloc(1024)
    this._holding = this._options.holding || Buffer.alloc(1024)
    this._input = this._options.input || Buffer.alloc(1024)
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
}

module.exports = ModbusServer
