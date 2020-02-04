'use strict'

/* global describe, it, beforeEach  */

const assert = require('assert')
const {
  ModbusRTUClientManager,
  ModbusRTUClient,
} = require('../dist/modbus')
const SerialPort = require('serialport')

describe('ModbusRTUClientManager Tests.', () => {
  /**
   * @type {ModbusRTUClientManager}
   */
  let manager
  /**
   * @type {SerialPort.OpenOptions}
   */
  let defaultSerialPortOptions

  const defaultSerialPortPath = '///this///is///not///a///real///path'

  beforeEach(function () {
    manager = new ModbusRTUClientManager();
    defaultSerialPortOptions = {
      baudRate: 9600,
      dataBits: 8,
      autoOpen: false,
    }
  })

  function generateRandomPath() {
    return defaultSerialPortPath + Math.floor(Math.random() * Math.pow(10, 10))
  }

  function addClient(path = defaultSerialPortPath, slaveId = 1, options = defaultSerialPortOptions) {

    const fullOptions = Object.assign({
      path,
      slaveId,
    },options)
    const client = manager.findOrCreateClient(fullOptions)

    assert.equal(client instanceof ModbusRTUClient, true)
    return client
  }

  function addMultipleSlavesById(host = defaultSerialPortPath, slaveCount = 5, slaveStart = 1){
    for(let slaveId = slaveStart; slaveId < (slaveCount + slaveStart); slaveId++){
      addClient(host, slaveId)
    }
  }

  function checkEmptyManager() {
    assert.equal(manager.clientCount, 0, 'Number of clients should be zero')
    assert.equal(manager.socketCount, 0, 'Number of sockets should be zero')
  }


  it('should add a client', () => {
    checkEmptyManager()

    const path = defaultSerialPortPath, slaveId = 1

    
    manager.createClient(Object.assign({
      path,
      slaveId,
    },defaultSerialPortOptions))

    assert.equal(manager.clientCount, 1, 'Number of clients should be one')
    assert.equal(manager.socketCount, 1, 'Number of sockets should be one')
  })

  it('should find a created client', () => {
    checkEmptyManager()

    const path = defaultSerialPortPath, slaveId = 1

    const client = manager.createClient(Object.assign({
      path,
      slaveId,
    },defaultSerialPortOptions))

    const foundClient = manager.findClient({
      path,
      slaveId,
    })

    assert.notEqual(foundClient, undefined, 'Searched for client should be defined')
    assert.equal(client, foundClient, 'Should be the same client')
    assert.equal(client.slaveId, foundClient.slaveId, 'Should have the same slaveId')
    assert.equal(client.socket.localAddress, foundClient.socket.localAddress, 'Should have the same localAddress')
    assert.equal(client.socket.localPort, foundClient.socket.localPort, 'Should have the same localAddress')

    assert.equal(manager.clientCount, 1, 'Number of clients should be one')
    assert.equal(manager.socketCount, 1, 'Number of sockets should be one')
  })

  it('should get accurate socketCount & clientCount', () => { 
    addMultipleSlavesById(generateRandomPath(), 10)
    addMultipleSlavesById(generateRandomPath(), 15)

    assert.equal(manager.clientCount, 25, 'Number of clients should be 25')
    assert.equal(manager.socketCount, 2, 'Number of sockets should be 2')
  })

  it('should filterClientsBySocket', () => { 

    const testPath = generateRandomPath()
    const testNumberOfClients = 15

    addMultipleSlavesById(generateRandomPath(), 10)
    addMultipleSlavesById(generateRandomPath(), 5)
    addMultipleSlavesById(generateRandomPath(), 2)
    addMultipleSlavesById(testPath, testNumberOfClients)

    const clients = manager.filterClientsBySocket({path: testPath})

    assert.equal(clients.size, testNumberOfClients, 'The number of clients should match the socket it is assigned to')

    const socket = manager.findSocket({
      path: testPath
    })
    for(const [_, client] of clients){
      assert.equal(socket, client.socket, 'Client socket should be the same socket for all clients')
    }
  })

  it('should findOrCreateClient but not duplicate', () => {
    const testPath = generateRandomPath()
    const testSlaveId = 6

    const options = Object.assign({
      path: testPath,
      slaveId: testSlaveId,
    },defaultSerialPortOptions);

    const client_1 = manager.findOrCreateClient(options)

    const client_2 = manager.findOrCreateClient(options)

    assert.equal(client_1 instanceof ModbusRTUClient, true, 'Client 1 should be an instance of ModbusRTUClient')
    assert.equal(client_2 instanceof ModbusRTUClient, true, 'Client 2 should be an instance of ModbusRTUClient')
    assert.equal(client_1, client_2, 'Client 1 should be the same reference as Client 2')

    assert.equal(manager.clientCount, 1, 'Number of clients should be one')
    assert.equal(manager.socketCount, 1, 'Number of sockets should be one')
  })

  it('should findSocket', () => { 
    const testPath = generateRandomPath()

    addClient(testPath)

    const socket = manager.findSocket({
      path: testPath
    })

    assert.equal(socket instanceof SerialPort, true, 'Socket should be an instance of SerialPort')
  })

  it('should findOrCreateSocket', () => { 
    const testPath = generateRandomPath()

    const socket = manager.findOrCreateSocket(Object.assign({
      path: testPath
    }, defaultSerialPortOptions))

    assert.equal(socket instanceof SerialPort, true, 'Socket should be an instance of SerialPort')
  })

  it('should removeSocket and all clients bound to that socket', () => { 
    const testPath = generateRandomPath()
    const testNumberOfClients = 15

    addMultipleSlavesById(generateRandomPath(), 10)
    addMultipleSlavesById(generateRandomPath(), 5)
    addMultipleSlavesById(generateRandomPath(), 2)
    addMultipleSlavesById(testPath, testNumberOfClients)

    let clients = manager.filterClientsBySocket({
      path: testPath
    })

    assert.equal(clients.size, testNumberOfClients, 'The number of clients should match the socket it is assigned to')

    manager.removeSocket({
      path: testPath
    })

    clients = manager.filterClientsBySocket({
      path: testPath
    })

    assert.equal(clients.size, 0, 'The number of clients after removing the socket should be zero')

  })

  it('should removeSocket and manually reject all requests for the clients', () => { 
    // TODO
  })

  it('should removeClient and manually reject all of the clients requests', () => { 
    // TODO
  })

  it('should remove clients by socket but not remove the original socket', () => { 
    const testPath = generateRandomPath()
    const testNumberOfClients = 15

    addMultipleSlavesById(generateRandomPath(), 10)
    addMultipleSlavesById(generateRandomPath(), 5)
    addMultipleSlavesById(generateRandomPath(), 2)
    addMultipleSlavesById(testPath, testNumberOfClients)

    let clients = manager.filterClientsBySocket({
      path: testPath
    })

    assert.equal(clients.size, testNumberOfClients, 'The number of clients should match the socket it is assigned to')

    manager.removeClientsBySocket({
      path: testPath
    })

    clients = manager.filterClientsBySocket({
      path: testPath
    })

    assert.equal(clients.size, 0, 'The number of clients should be zero')

    const socket = manager.findSocket({
      path: testPath
    })

    assert.equal(socket instanceof SerialPort, true, 'Socket should be an instance of SerialPort')
  })

  it('should remove all unused sockets', () => { 
    const testPath = generateRandomPath()

    addMultipleSlavesById(generateRandomPath(), 10)
    addMultipleSlavesById(generateRandomPath(), 5)
    addMultipleSlavesById(generateRandomPath(), 2)
    
    manager.createSocket(Object.assign({
      path: testPath
    }, defaultSerialPortOptions))

    let clients = manager.filterClientsBySocket({
      path: testPath
    })

    assert.equal(clients.size, 0, 'The number of clients should be zero')

    manager.removeAllUnusedSockets()

    const socket = manager.findSocket({
      path: testPath
    })

    assert.equal(socket, undefined, 'Socket should not be found')
  })

  it('should create a client where the socket only has a maximum of 255 listeners', () => {
    checkEmptyManager()

    const client = addClient()

    assert.equal(client.socket.getMaxListeners(), 255, 'Number of listeners should equal 255')

    assert.equal(manager.clientCount, 1, 'Number of clients should be one')
    assert.equal(manager.socketCount, 1, 'Number of sockets should be one')
  })

  it('should only add one socket for clients with the same host & port', () => {
    checkEmptyManager()

    const testPath = generateRandomPath()

    const numClients = 255;

    for (let slaveId = 1; slaveId < numClients; slaveId++){
      addClient(testPath, slaveId)
    }

    assert.equal(manager.clientCount, numClients - 1, `Number of clients should be ${numClients}`)
    assert.equal(manager.socketCount, 1, 'Number of sockets should be one')
  })

  it('should not allow duplicate clients to be created', () => {
    checkEmptyManager()

    const testPath = generateRandomPath()
    const slaveId = 1;

    manager.createClient(Object.assign({
      path: testPath,
      slaveId
    },defaultSerialPortOptions))

    assert.throws(() => manager.createClient({ host, port, slaveId }))

    assert.equal(manager.clientCount, 1, 'Number of clients should be one')
    assert.equal(manager.socketCount, 1, 'Number of sockets should be one')
  })


})
