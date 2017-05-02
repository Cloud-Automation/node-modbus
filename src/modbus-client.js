let debug = require('debug')('modbus-client')

let ReadCoilsRequestBody = require('./request/read-coils.js')
let ReadDiscreteInputsRequestBody = require('./request/read-discrete-inputs.js')
let ReadHoldingRegistersRequestBody = require('./request/read-holding-registers.js')
let ReadInputRegistersRequestBody = require('./request/read-input-registers.js')
let WriteSingleCoilRequestBody = require('./request/write-single-coil.js')
let WriteSingleRegisterRequestBody = require('./request/write-single-register.js')
let WriteMultipleCoilsRequestBody = require('./request/write-multiple-coils.js')
let WriteMultipleRegistersRequestBody = require('./request/write-multiple-registers.js')

class ModbusClient {

  constructor (socket) {
    this._socket = socket

    if (!socket) {
      throw new Error('NoSocketException.')
    }

    this._socket.on('data', this._onData.bind(this))
  }

  _onData (data) {
    debug('received data')

    this._responseHandler.handleData(data)

    /* get latest message from message handler */

    do {
      let response = this._responseHandler.shift()

      /* no message was parsed by now, come back later */
      if (!response) {
        return
      }

      /* process the response in the request handler */
      this._requestHandler.handle(response)
    } while (1)
  }

  readCoils (start, count) {
    let request = new ReadCoilsRequestBody(start, count)

    return this._requestHandler.register(request)
  }

  readDiscreteInputs (start, count) {
    let request = new ReadDiscreteInputsRequestBody(start, count)

    return this._requestHandler.register(request)
  }

  readHoldingRegisters (start, count) {
    let request = new ReadHoldingRegistersRequestBody(start, count)

    return this._requestHandler.register(request)
  }

  readInputRegisters (start, count) {
    let request = new ReadInputRegistersRequestBody(start, count)

    return this._requestHandler.register(request)
  }

  writeSingleCoil (address, value) {
    let request = new WriteSingleCoilRequestBody(address, value)

    return this._requestHandler.register(request)
  }

  writeSingleRegister (address, value) {
    let request = new WriteSingleRegisterRequestBody(address, value)

    return this._requestHandler.register(request)
  }

  writeMultipleCoils (start, values, quantity) {
    let request = new WriteMultipleCoilsRequestBody(start, values, quantity)

    return this._requestHandler.register(request)
  }

  writeMultipleRegisters (start, values) {
    let request = new WriteMultipleRegistersRequestBody(start, values)

    return this._requestHandler.register(request)
  }

}

module.exports = ModbusClient
