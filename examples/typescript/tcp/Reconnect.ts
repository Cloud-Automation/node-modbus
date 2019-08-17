import Modbus from '../../..'
import { Socket, SocketConnectOpts } from 'net'

const socket = new Socket()

const options: SocketConnectOpts = {
  host: '127.0.0.1',
  port: 8502
}
const client = new Modbus.client.TCP(socket)

let successCount = 0
let errorCount = 0
let reconnectCount = 0
let closedOnPurpose = false
let firstTime = true

const readStart = 0;
const readCount = 10;

const start = function () {
  console.log('Starting request...')

  client.readHoldingRegisters(readStart, readCount)
    .then(({ metrics, request, response }) => {
      successCount += 1

      console.log('Transfer Time: ' + metrics.transferTime)
      console.log('Response Body Payload: ' + response.body.valuesAsArray)
      console.log('Response Body Payload As Buffer: ' + response.body.valuesAsBuffer)

      console.log('Success', successCount, 'Errors', errorCount, 'Reconnect', reconnectCount)
      console.log('Request finished successfull.')

      setTimeout(start, 2000)
    })
    .catch(err => {
      console.error(err)
      errorCount += 1

      console.log('Success', successCount, 'Errors', errorCount, 'Reconnect', reconnectCount)

      console.log('Request finished Unsuccessfully.')
    })
}

socket.on('connect', function () {
  console.log('client connected.')

  if (firstTime) {
    firstTime = false
  } else {
    reconnectCount += 1
  }

  start()
})

const shutdown = () => {
  closedOnPurpose = true
  socket.end()
}

const reconnect = () => {
  if (!closedOnPurpose) {
    socket.connect(options)
  }
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

socket.on('close', function () {
  console.log('Socket closed, stopping interval.')
  reconnect()
})

socket.on('error', function (err) {
  console.log('Socket Error', err)
})
