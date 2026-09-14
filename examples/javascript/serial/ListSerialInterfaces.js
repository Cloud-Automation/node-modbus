'use strict'

const { SerialPort } = require('serialport')

SerialPort.list()
  .then(function (ports) {
    ports.forEach(function (port) {
      console.log(port.path)
    })
  })
  .catch(console.error)
