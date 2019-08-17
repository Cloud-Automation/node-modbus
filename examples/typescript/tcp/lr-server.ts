import Modbus from '../../../dist/modbus'
import { Server } from 'net'

const netServer = new Server()

const server = new Modbus.server.TCP(netServer)

server.on('connection', function () {

})

netServer.listen(8502)
