

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
import ModbusTCPClient from './modbus-tcp-client.js';

/** module:jsmodbus.client.RTU
 * @example <caption>Create new Modbus/RTU Client.</caption>
 * const Modbus = require('jsmodbus')
 * const SerialPort = require('serialport')
 * const socket = new SerialPort('/dev/tty/ttyUSB0', { baudRate: 57600 })
 * const client = new Modbus.client.TCP(socket, address)
 */

import ModbusRTUClient from './modbus-rtu-client.js';

/** module:jsmodbus.server.TCP */
import ModbusTCPServer from './modbus-tcp-server.js';

/** module:jsmodbus.server.RTU */
import ModbusRTUServer from './modbus-rtu-server.js';

import * as Requests from './request';
import * as Responses from './response';
import * as Codes from './codes';
import UserRequest from './user-request.js';
import * as Errors from './errors';

export const client = {
  TCP: ModbusTCPClient,
  RTU: ModbusRTUClient
}

export const server = {
  TCP: ModbusTCPServer,
  RTU: ModbusRTUServer
}



export const requests = {
  ...Requests,
  UserRequest,
};

export const responses = Responses;
export const codes = Codes;
export const errors = Errors