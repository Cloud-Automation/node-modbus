let debug = require('debug')('modbus-client')

let ReadCoilsRequestBody = require('./request/read-coils.js')
let ReadDiscreteInputsRequestBody = require('./request/read-discrete-inputs.js')
let ReadHoldingRegistersRequestBody = require('./request/read-holding-registers.js')
let ReadInputRegistersRequestBody = require('./request/read-input-registers.js')
let WriteSingleCoilRequestBody = require('./request/write-single-coil.js')
let WriteSingleRegisterRequestBody = require('./request/write-single-register.js')
let WriteMultipleCoilsRequestBody = require('./request/write-multiple-coils.js')
let WriteMultipleRegistersRequestBody = require('./request/write-multiple-registers.js')

/** Common Modbus Client
 * @abstract
 */
class ModbusClient {

  /** Creates a new Modbus client object.
   * @param {Socket} socket A socket object
   * @throws {NoSocketException}
   */
  constructor (socket) {
    if (new.target === ModbusClient) {
      throw new TypeError('Cannot instantiate ModbusClient directly.')
    }

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

  /** Execute ReadCoils Request (Function Code 0x01)
   * @param {Number} start Start Address.
   * @param {Number} count Coil Quantity.
   * @returns {Promise}
   * @example
   * client.readCoils(0, 10).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  readCoils (start, count) {
    debug('issuing new read coils request')
    let request

    try {
      request = new ReadCoilsRequestBody(start, count)
    } catch (e) {
      return Promise.reject({err: e.message})
    }

    return this._requestHandler.register(request)
  }

  /** Execute ReadDiscreteInputs Request (Function Code 0x02)
   * @param {Number} start Start Address.
   * @param {Number} count Coil Quantity.
   * @returns {Promise}
   * @example
   * client.readDiscreteInputs(0, 10).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  readDiscreteInputs (start, count) {
    debug('issuing new read discrete inputs request')
    let request
    try {
      request = new ReadDiscreteInputsRequestBody(start, count)
    } catch (e) {
      return Promise.reject({err: e.message})
    }

    return this._requestHandler.register(request)
  }

  /** Execute ReadHoldingRegisters Request (Function Code 0x03)
   * @param {Number} start Start Address.
   * @param {Number} count Coil Quantity.
   * @returns {Promise}
   * @example
   * client.readHoldingRegisters(0, 10).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  readHoldingRegisters (start, count) {
    debug('issuing new read holding registers request')
    let request
    try {
      request = new ReadHoldingRegistersRequestBody(start, count)
    } catch (e) {
      return Promise.reject({err: e.message})
    }

    return this._requestHandler.register(request)
  }

  /** Execute ReadInputRegisters Request (Function Code 0x04)
   * @param {Number} start Start Address.
   * @param {Number} count Coil Quantity.
   * @returns {Promise}
   * @example
   * client.readInputRegisters(0, 10).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  readInputRegisters (start, count) {
    debug('issuing new read input registers request')

    let request
    try {
      request = new ReadInputRegistersRequestBody(start, count)
    } catch (e) {
      return Promise.reject({err: e.message})
    }

    return this._requestHandler.register(request)
  }

  /** Execute WriteSingleCoil Request (Function Code 0x05)
   * @param {Number} address Address.
   * @param {Boolean} value Value.
   * @returns {Promise}
   * @example
   * client.writeSingleCoil(10, true).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  writeSingleCoil (address, value) {
    debug('issuing new write single coil request')

    let request
    try {
      request = new WriteSingleCoilRequestBody(address, value)
    } catch (e) {
      return Promise.reject({err: e.message})
    }

    return this._requestHandler.register(request)
  }

  /** Execute WriteSingleRegister Request (Function Code 0x06)
   * @param {Number} address Address.
   * @param {Number} value Value.
   * @returns {Promise}
   * @example
   * client.writeSingleRegister(10, 1234).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  writeSingleRegister (address, value) {
    debug('issuing new write single register request')
    let request
    try {
      request = new WriteSingleRegisterRequestBody(address, value)
    } catch (e) {
      return Promise.reject({err: e.message})
    }

    return this._requestHandler.register(request)
  }

  /** Execute WriteMultipleCoils Request (Function Code 0x0F)
   * @param {Number} address Address.
   * @param {Array|Buffer} values Values either as an Array[Boolean] or a Buffer.
   * @param {Number} quantity If you choose to use the Buffer for the values then you have to
   *   specify the quantity of bytes.
   * @returns {Promise}
   * @example
   * client.writeMultipleCoils(10, [true, false, true, false, true]).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   * @example
   * client.writeMultipleCoils(10, Buffer.from([0xdd]), 7).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  writeMultipleCoils (start, values, quantity) {
    debug('issuing new write multiple coils request')

    let request
    try {
      request = new WriteMultipleCoilsRequestBody(start, values, quantity)
    } catch (e) {
      return Promise.reject({err: e.message})
    }

    return this._requestHandler.register(request)
  }

  /** Execute WriteMultipleRegisters Request (Function Code 0x10)
   * @param {Number} address Address.
   * @param {Array|Buffer} values Values either as an Array[UInt16] or a Buffer.
   * @returns {Promise}
   * @example
   * client.writeMultipleRegisters(10, [0x1234, 0x5678, 0x9ABC, 0xDEF0]).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   * @example
   * client.writeMultipleRegisters(10, Buffer.from([0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC, 0xDE, 0xF0])).then(function (res) {
   *   console.log(res.response, res.request)
   * }).catch(function (err) {
   *   ...
   * })
   */
  writeMultipleRegisters (start, values) {
    debug('issuing new write multiple registers request')

    let request
    try {
      request = new WriteMultipleRegistersRequestBody(start, values)
    } catch (e) {
      return Promise.reject({err: e.message})
    }

    return this._requestHandler.register(request)
  }

}

module.exports = ModbusClient
