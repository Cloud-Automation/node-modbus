'use strict'

exports.client = {
  TCP: require('./modbus-tcp-client.js'),
  Serial: require('./modbus-serial-client.js')
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

