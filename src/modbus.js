'use strict'

/** jsModbus is a node.js module that enables the developer to interact with modbus/tcp and modbus/rtu server (slaves)
 * or to create a modbus/tcp server (master).
 * @module jsmodbus
 *
 */

/** module:jsmodbus.client.TCP
 * @example <caption>Create new Modbus/TCP Client.</caption>
 * let Modbus = require('jsmodbus')
 * let net = require('net')
 * let socket = new new.Socket()
 * let client = new Modbus.client.TCP(socket, unitId)
 * let options = {
 *   'host' : host
 *   'port' : port
 *   }
 *
 *  socket.connect(options)
 */
let ModbusTCPClient = require('./modbus-tcp-client.js')

/** module:jsmodbus.client.RTU
 * @example <caption>Create new Modbus/RTU Client.</caption>
 * let Modbus = require('jsmodbus')
 * let SerialPort = require('serialport')
 * let socket = new SerialPort('/dev/tty/ttyUSB0', { baudRate: 57600 })
 * let client = new Modbus.client.TCP(socket, address)
 */

let ModbusRTUClient = require('./modbus-rtu-client.js')

/** module:jsmodbus.server.TCP */
let ModbusTCPServer = require('./modbus-tcp-server.js')

module.exports = {
  'client': {
    'TCP': ModbusTCPClient,
    'RTU': ModbusRTUClient
  },
  server: {
    'TCP': ModbusTCPServer
  }
}
