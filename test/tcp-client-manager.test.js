'use strict'

/* global describe, it, beforeEach  */

const assert = require('assert')
const {
  ModbusTCPClientManager,
  ModbusTCPClient,
} = require('../dist/modbus')
const sinon = require('sinon')
const EventEmitter = require('events')

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
    for(let slaveId = slaveStart; slaveId < (slaveCount + slaveStart); i++){
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
    addMultipleSlavesById('localhost', 5052, 15)

    assert.equal(manager.clientCount, 25, 'Number of clients should be 25')
    assert.equal(manager.socketCount, 2, 'Number of sockets should be 2')
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
