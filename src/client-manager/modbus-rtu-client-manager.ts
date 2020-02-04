import SerialPort, { OpenOptions } from 'serialport'
import { MapUtils } from '../map-utils'
import ModbusRTUClient from '../modbus-rtu-client'

// typealiases
type SlaveId = number
type SocketId = string
type ClientId = string

interface IRTUInfo extends OpenOptions {
  path: string
}

interface IRTUSlaveInfo extends IRTUInfo {
  slaveId: SlaveId
}

export default class ModbusRTUClientManager {

  public static async ListSerialPorts () {
    const ports = await SerialPort.list()

    return ports
  }

  public readonly clients = new Map<ClientId, ModbusRTUClient>()
  public readonly sockets = new Map<SocketId, SerialPort>()

  public get socketCount () {
    return this.sockets.size
  }

  public get clientCount () {
    return this.clients.size
  }

  public findClient (rtuSlaveInfo: IRTUSlaveInfo) {
    const clientId = this.marshalClientId(rtuSlaveInfo)
    return this.clients.get(clientId)
  }

  /**
   * Returns a map of all clients that are bound to a specific socket
   */
  public filterClientsBySocket (rtuInfo: IRTUInfo) {
    return MapUtils.Filter(this.clients,
      (
        ([clientId]) => {
          const { path } = this.unmarshalClientId(clientId)
          return rtuInfo.path === path
        }
      )
    )
  }

  /**
   * Finds or creates a modbus rtu client
   */
  public findOrCreateClient (rtuClientInfo: IRTUSlaveInfo) {
    return this.findClient(rtuClientInfo) || this.createClient(rtuClientInfo)
  }

  /**
   * Creates a modbus rtu client
   */
  public createClient (rtuInfo: IRTUSlaveInfo, timeout = 2000) {
    const socket = this.findOrCreateSocket(rtuInfo)
    const client = new ModbusRTUClient(socket, rtuInfo.slaveId, timeout)
    const clientId = this.marshalClientId(rtuInfo)
    this.clients.set(clientId, client)
    return client
  }

  /**
   * Finds a modbus rtu client
   */
  public findSocket (rtuInfo: IRTUInfo) {
    return this.sockets.get(this.marshalSocketId(rtuInfo))
  }

  /**
   * Finds or creates a rtu socket connection
   * @param {string} host
   * @param {number} port
   */
  public findOrCreateSocket (rtuInfo: IRTUInfo) {
    return this.findSocket(rtuInfo) || this.createSocket(rtuInfo)
  }

  /**
   * Creates a rtu socket connection
   */
  public createSocket (rtuInfo: IRTUInfo) {
    const {
      path,
      ...options
    } = rtuInfo
    const socket = new SerialPort(path, options)

    // set maximum listeners to the maximum number of clients for
    // a single rtu master
    socket.setMaxListeners(255)

    const socketId = this.marshalSocketId(rtuInfo)
    this.sockets.set(socketId, socket)

    return socket
  }

  /**
   * Removes a rtu socket connection and all bound clients
   */
  public removeSocket (rtuInfo: IRTUInfo) {
    const socket = this.findSocket(rtuInfo)
    if (socket) {
      this.removeClientsBySocket(rtuInfo)
      socket.end()
      const socketId = this.marshalSocketId(rtuInfo)
      this.sockets.delete(socketId)
    }
  }

  /**
   * Removes a modbus rtu client
   */
  public removeClient (rtuSlaveInfo: IRTUSlaveInfo) {
    const client = this.findClient(rtuSlaveInfo)
    if (client) {
      client.manuallyRejectAllRequests()
      this.clients.delete(this.marshalClientId(rtuSlaveInfo))
    }
  }

  /**
   * Removes all clients assosciated to a single socket
   */
  public removeClientsBySocket (rtuInfo: IRTUInfo) {
    const clients = this.filterClientsBySocket(rtuInfo)
    for (const [clientId] of clients) {
      const { slaveId } = this.unmarshalClientId(clientId)
      this.removeClient({
        path: rtuInfo.path,
        slaveId
      })
    }
  }

  /**
   * Removes all unused sockets. An unused socket is a socket
   * that has no clients that use it
   */
  public removeAllUnusedSockets () {
    const socketsWithoutClients = this.findSocketsWithoutClients()
    for (const [socketId] of socketsWithoutClients) {
      const rtuInfo = this.unmarshalSocketId(socketId)
      this.removeSocket(rtuInfo)
    }
  }

  /**
   * Finds sockets that do not have any clients using it
   */
  private findSocketsWithoutClients () {
    const unusedSocketMap = new Map<SocketId, SerialPort>()

    for (const [socketId, socket] of this.sockets) {
      const rtuInfo = this.unmarshalSocketId(socketId)
      const clients = this.filterClientsBySocket(rtuInfo)
      if (clients.size === 0) {
        unusedSocketMap.set(socketId, socket)
      }
    }

    return unusedSocketMap
  }

  private marshalSocketId ({ path }: IRTUInfo): SocketId {
    return `${path}`
  }

  private unmarshalSocketId (socketId: SocketId): IRTUInfo {
    return {
      path: socketId
    }
  }

  private marshalClientId ({ path, slaveId }: IRTUSlaveInfo): ClientId {
    return `${path}.${slaveId}`
  }

  private unmarshalClientId (clientId: ClientId): IRTUSlaveInfo {
    const [path, slaveId] = clientId.split('.')

    return {
      path,
      slaveId: parseInt(slaveId, 10)
    }
  }
}
