const modbus = require('../../..')

const manager = new modbus.ModbusTCPClientManager()

const socket = manager.findOrCreateSocket({
  host: 'localhost',
  port: 5052,
})

socket.on('connect', () => {
  console.log('SOCKET CONNECTED')

  setInterval(() => {
    for(const [clientId, client] of manager.clients){
      client
        .readCoils(0, 5)
        .then(({response}) => console.log(response.body.valuesAsArray))
        .catch(console.error)
    }
  }, 1000)
})

for(let i = 0; i < 50; i++) {
  manager.findOrCreateClient({
    host: 'localhost',
    port: 5052,
    slaveId: i
  })
}


console.log(manager.clientCount) // should be 50
console.log(manager.socketCount) // should be 1