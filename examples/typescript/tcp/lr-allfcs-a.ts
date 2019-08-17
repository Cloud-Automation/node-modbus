import Modbus from '../../..'
import { Socket, SocketConnectOpts } from 'net'

const socket = new Socket()

const options: SocketConnectOpts = {
  host: '127.0.0.1',
  port: 8502
}

const client = new Modbus.client.TCP(socket)
let cycleDone = true

socket.on('connect', function () {
  setInterval(function () {
    if (!cycleDone) {
      return
    }

    cycleDone = false

    const fc01 = client.readCoils(0, 40)
    const fc02 = client.readDiscreteInputs(0, 40)
    const fc03 = client.readHoldingRegisters(0, 100)
    const fc04 = client.readInputRegisters(0, 100)

    const fc05StartAddress = Math.trunc(Math.random() * 1000)
    const fc05 = client.writeSingleCoil(fc05StartAddress, true)

    const fc06StartAddress = Math.trunc(Math.random() * 100)
    const fc06Value = Math.trunc(Math.random() * 0xFFFF)
    const fc06 = client.writeSingleRegister(fc06StartAddress, fc06Value)

    const fc0FStartAddress = Math.trunc(Math.random() * 100)
    const fc0FBufferSize = Math.trunc(Math.random() * 100)
    const fc0F = client.writeMultipleCoils(fc0FStartAddress, Buffer.alloc(fc0FBufferSize * 2), fc0FBufferSize)

    const fc10StartAddress = Math.trunc(Math.random() * 100)
    const fc10BufferSize = Math.trunc(Math.random() * 100)
    const fc10 = client.writeMultipleCoils(fc10StartAddress, Buffer.alloc(fc10BufferSize * 2), fc0FBufferSize)

    const allFcs = Promise.all([fc01, fc02, fc03, fc04, fc05, fc06, fc0F, fc10])

    allFcs
      .then(function () {
        cycleDone = true
      })
      .finally(() => socket.end())
  }, 100)
})

socket.on('error', console.error)

socket.connect(options)

