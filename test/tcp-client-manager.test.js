'use strict'

/* global describe, it, beforeEach  */

const assert = require('assert')
const {
  ModbusTCPClientManager,
  ModbusTCPClient,
} = require('../dist/modbus')
const { Socket } = require('net')

describe('ModbusTCPClientManager Tests.', () => {
  /**
   * @type {ModbusTCPClientManager}
   */
  let manager

  beforeEach(function () {
    manager = new ModbusTCPClientManager();
  })

  function addClient(host = 'localhost', port = 5052, slaveId = 1) {

    const client = manager.findOrCreateClient({
      host,
      port,
      slaveId,
    })

    assert.equal(client instanceof ModbusTCPClient, true)
    return client
  }

  function addMultipleSlavesById(host = 'localhost', port = 5052, slaveCount = 5, slaveStart = 1){
    for(let slaveId = slaveStart; slaveId < (slaveCount + slaveStart); slaveId++){
      addClient(host, port, slaveId)
    }
  }

  function checkEmptyManager() {
    assert.equal(manager.clientCount, 0, 'Number of clients should be zero')
    assert.equal(manager.socketCount, 0, 'Number of sockets should be zero')
  }


  it('should add a client', () => {
    checkEmptyManager()

    const host = 'localhost', port = 5052, slaveId = 1

    manager.createClient({
      host,
      port,
      slaveId,
    })

    assert.equal(manager.clientCount, 1, 'Number of clients should be one')
    assert.equal(manager.socketCount, 1, 'Number of sockets should be one')
  })

  it('should find a created client', () => {
    checkEmptyManager()

    const host = 'localhost', port = 5052, slaveId = 1

    const client = manager.createClient({
      host,
      port,
      slaveId,
    })

    const foundClient = manager.findClient({
      host,
      port,
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
    addMultipleSlavesById('localhost', 5052, 10)
    addMultipleSlavesById('localhost', 5053, 15)

    assert.equal(manager.clientCount, 25, 'Number of clients should be 25')
    assert.equal(manager.socketCount, 2, 'Number of sockets should be 2')
  })

  it('should filterClientsBySocket', () => { 

    const testHost = 'localhost'
    const testPort = 5055
    const testNumberOfClients = 15

    addMultipleSlavesById('localhost', 5052, 10)
    addMultipleSlavesById('localhost', 5053, 5)
    addMultipleSlavesById('localhost', 5054, 2)
    addMultipleSlavesById(testHost, testPort, testNumberOfClients)

    const clients = manager.filterClientsBySocket({host: testHost, port: testPort})

    assert.equal(clients.size, testNumberOfClients, 'The number of clients should match the socket it is assigned to')

    const socket = manager.findSocket({
      host: testHost,
      port: testPort
    })
    for(const [_, client] of clients){
      assert.equal(socket, client.socket, 'Client socket should be the same socket for all clients')
    }
  })

  it('should findOrCreateClient but not duplicate', () => {
    const testHost = 'localhost'
    const testPort = 5055
    const testSlaveId = 6

    const client_1 = manager.findOrCreateClient({
      host: testHost,
      port: testPort,
      slaveId: testSlaveId
    })

    const client_2 = manager.findOrCreateClient({
      host: testHost,
      port: testPort,
      slaveId: testSlaveId
    })

    assert.equal(client_1 instanceof ModbusTCPClient, true, 'Client 1 should be an instance of ModbusTCPClient')
    assert.equal(client_2 instanceof ModbusTCPClient, true, 'Client 2 should be an instance of ModbusTCPClient')
    assert.equal(client_1, client_2, 'Client 1 should be the same reference as Client 2')

    assert.equal(manager.clientCount, 1, 'Number of clients should be one')
    assert.equal(manager.socketCount, 1, 'Number of sockets should be one')
  })

  it('should findSocket', () => { 
    const testHost = 'localhost'
    const testPort = 5055

    addClient(testHost, testPort)

    const socket = manager.findSocket({
      host: testHost,
      port: testPort
    })

    assert.equal(socket instanceof Socket, true, 'Socket should be an instance of Socket')
  })

  it('should findOrCreateSocket', () => { 
    const testHost = 'localhost'
    const testPort = 5055

    const socket = manager.findOrCreateSocket({
      host: testHost,
      port: testPort
    })

    assert.equal(socket instanceof Socket, true, 'Socket should be an instance of Socket')
  })

  it('should removeSocket and all clients bound to that socket', () => { 
    const testHost = 'localhost'
    const testPort = 5055
    const testNumberOfClients = 15

    addMultipleSlavesById('localhost', 5052, 10)
    addMultipleSlavesById('localhost', 5053, 5)
    addMultipleSlavesById('localhost', 5054, 2)
    addMultipleSlavesById(testHost, testPort, testNumberOfClients)

    let clients = manager.filterClientsBySocket({host: testHost, port: testPort})

    assert.equal(clients.size, testNumberOfClients, 'The number of clients should match the socket it is assigned to')

    manager.removeSocket({
      host: testHost,
      port: testPort
    })

    clients = manager.filterClientsBySocket({host: testHost, port: testPort})

    assert.equal(clients.size, 0, 'The number of clients after removing the socket should be zero')

  })

  it('should removeSocket and manually reject all requests for the clients', () => { 
    // TODO
  })

  it('should removeClient and manually reject all of the clients requests', () => { 
    // TODO
  })

  it('should remove clients by socket but not remove the original socket', () => { 
    const testHost = 'localhost'
    const testPort = 5055
    const testNumberOfClients = 15

    addMultipleSlavesById('localhost', 5052, 10)
    addMultipleSlavesById('localhost', 5053, 5)
    addMultipleSlavesById('localhost', 5054, 2)
    addMultipleSlavesById(testHost, testPort, testNumberOfClients)

    let clients = manager.filterClientsBySocket({host: testHost, port: testPort})

    assert.equal(clients.size, testNumberOfClients, 'The number of clients should match the socket it is assigned to')

    manager.removeClientsBySocket({
      host: testHost,
      port: testPort
    })

    clients = manager.filterClientsBySocket({host: testHost, port: testPort})

    assert.equal(clients.size, 0, 'The number of clients should be zero')

    const socket = manager.findSocket({
      host: testHost,
      port: testPort
    })

    assert.equal(socket instanceof Socket, true, 'Socket should be an instance of Socket')
  })

  it('should remove all unused sockets', () => { 
    const testHost = 'localhost'
    const testPort = 5055

    addMultipleSlavesById('localhost', 5052, 10)
    addMultipleSlavesById('localhost', 5053, 5)
    addMultipleSlavesById('localhost', 5054, 2)
    
    manager.createSocket({
      host: testHost,
      port: testPort
    })

    let clients = manager.filterClientsBySocket({host: testHost, port: testPort})

    assert.equal(clients.size, 0, 'The number of clients should be zero')

    manager.removeAllUnusedSockets()

    const socket = manager.findSocket({
      host: testHost,
      port: testPort
    })

    assert.equal(socket, undefined, 'Socket not be found')
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

    const host = 'localhost'
    const port = 5052

    const numClients = 255;

    for (let slaveId = 1; slaveId < numClients; slaveId++){
      addClient(host, port, slaveId)
    }

    assert.equal(manager.clientCount, numClients - 1, `Number of clients should be ${numClients}`)
    assert.equal(manager.socketCount, 1, 'Number of sockets should be one')
  })

  it('should not allow duplicate clients to be created', () => {
    checkEmptyManager()

    const host = 'localhost'
    const port = 5052
    const slaveId = 1;

    manager.createClient({ host, port, slaveId })

    assert.throws(() => manager.createClient({ host, port, slaveId }))

    assert.equal(manager.clientCount, 1, 'Number of clients should be one')
    assert.equal(manager.socketCount, 1, 'Number of sockets should be one')
  })


})
