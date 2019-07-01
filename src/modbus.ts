'use strict'

/** jsModbus is a node.js module that enables the developer to interact with modbus/tcp and modbus/rtu server (slaves)
 * or to create a modbus/tcp server (master).
 * @module jsmodbus
 *
 */

/** module:jsmodbus.client.TCP
 * @example <caption>Create new Modbus/TCP Client.</caption>
 * const Modbus = require('jsmodbus')
 * const net = require('net')
 * const socket = new new.Socket()
 * const client = new Modbus.client.TCP(socket, unitId)
 * const options = {
 *   'host' : host
 *   'port' : port
 *   }
 *
 *  socket.connect(options)
 */
const ModbusTCPClient = require('./modbus-tcp-client.js')

/** module:jsmodbus.client.RTU
 * @example <caption>Create new Modbus/RTU Client.</caption>
 * const Modbus = require('jsmodbus')
 * const SerialPort = require('serialport')
 * const socket = new SerialPort('/dev/tty/ttyUSB0', { baudRate: 57600 })
 * const client = new Modbus.client.TCP(socket, address)
 */

const ModbusRTUClient = require('./modbus-rtu-client.js')

/** module:jsmodbus.server.TCP */
const ModbusTCPServer = require('./modbus-tcp-server.js')

/** module:jsmodbus.server.RTU */
const ModbusRTUServer = require('./modbus-rtu-server.js')

module.exports = {
  'client': {
    'TCP': ModbusTCPClient,
    'RTU': ModbusRTUClient
  },
  server: {
    'TCP': ModbusTCPServer,
    'RTU': ModbusRTUServer
  }
}
