import { SerialPort } from 'serialport'

SerialPort.list()
  .then(ports => {
    ports.forEach(port => {
      console.log(port.path)
    })
  })
  .catch(console.error)
