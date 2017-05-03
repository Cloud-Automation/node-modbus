'use strict'

exports.client = {
  TCP: require('./modbus-tcp-client.js'),
  RTU: require('./modbus-rtu-client.js')
}

/*
exports.server = {
  tcp: {
    core: require('./modbus-tcp-server.js'),
    complete: require('./modbus-tcp-server.js')
  },
  handler: { }
}
*/

