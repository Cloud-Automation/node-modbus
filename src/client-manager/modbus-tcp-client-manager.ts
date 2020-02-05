import { Socket } from 'net'
import { MapUtils } from '../map-utils'
import ModbusTCPClient from '../modbus-tcp-client'

// typealiases
type Host = string
type Port = number
type SlaveId = number
type SocketId = string
type ClientId = string

interface ITCPInfo {
  host: Host,
  port: Port
}

interface ITCPSlaveInfo extends ITCPInfo {
  slaveId: SlaveId
}

enum ErrorCode {
  DUPLICATE_SOCKET = 'DUPLICATE_SOCKET',
  DUPLICATE_CLIENT = 'DUPLICATE_CLIENT'
}

export default class ModbusTCPClientManager {

  public static ErrorCode = ErrorCode

  public readonly clients = new Map<ClientId, ModbusTCPClient>()
  public readonly sockets = new Map<SocketId, Socket>()

  public get socketCount () {
    return this.sockets.size
  }

  public get clientCount () {
    return this.clients.size
  }

  public findClient (tcpSlaveInfo: ITCPSlaveInfo) {
    const clientId = this.marshalClientId(tcpSlaveInfo)
    return this.clients.get(clientId)
  }

  /**
   * Returns a map of all clients that are bound to a specific socket
   */
  public filterClientsBySocket (tcpInfo: ITCPInfo) {
    return MapUtils.Filter(this.clients,
      (
        ([clientId]) => {
          const { host, port } = this.unmarshalClientId(clientId)
          return tcpInfo.host === host && tcpInfo.port === port
        }
      )
    )
  }

  /**
   * Finds or creates a modbus tcp client
   */
  public findOrCreateClient (tcpClientInfo: ITCPSlaveInfo) {
    return this.findClient(tcpClientInfo) || this.createClient(tcpClientInfo)
  }

  /**
   * Creates a modbus tcp client
   */
  public createClient (tcpInfo: ITCPSlaveInfo, timeout = 2000) {
    const socket = this.findOrCreateSocket(tcpInfo)

    if (this.findClient(tcpInfo) !== undefined) {
      throw new Error(ErrorCode.DUPLICATE_CLIENT)
    }

    const client = new ModbusTCPClient(socket, tcpInfo.slaveId, timeout)
    const clientId = this.marshalClientId(tcpInfo)
    this.clients.set(clientId, client)
    return client
  }

  /**
   * Finds a modbus tcp client
   */
  public findSocket (tcpInfo: ITCPInfo) {
    return this.sockets.get(this.marshalSocketId(tcpInfo))
  }

  /**
   * Finds or creates a tcp socket connection
   * @param {string} host
   * @param {number} port
   */
  public findOrCreateSocket (tcpInfo: ITCPInfo) {
    return this.findSocket(tcpInfo) || this.createSocket(tcpInfo)
  }

  /**
   * Creates a tcp socket connection
   */
  public createSocket (tcpInfo: ITCPInfo) {

    if (this.findSocket(tcpInfo) !== undefined) {
      throw new Error(ErrorCode.DUPLICATE_SOCKET)
    }

    const socket = new Socket()

    socket.connect(tcpInfo)

    // set maximum listeners to the maximum number of clients for
    // a single tcp master
    socket.setMaxListeners(255)

    const socketId = this.marshalSocketId(tcpInfo)
    this.sockets.set(socketId, socket)

    return socket
  }

  /**
   * Removes a tcp socket connection and all bound clients
   */
  public removeSocket (tcpInfo: ITCPInfo) {
    const socket = this.findSocket(tcpInfo)
    if (socket) {
      this.removeClientsBySocket(tcpInfo)
      socket.end()
      const socketId = this.marshalSocketId(tcpInfo)
      this.sockets.delete(socketId)
    }
  }

  /**
   * Removes a modbus tcp client
   */
  public removeClient (tcpSlaveInfo: ITCPSlaveInfo) {
    const client = this.findClient(tcpSlaveInfo)
    if (client) {
      client.manuallyRejectAllRequests()
      this.clients.delete(this.marshalClientId(tcpSlaveInfo))
    }
  }

  /**
   * Removes all clients assosciated to a single socket
   */
  public removeClientsBySocket (tcpInfo: ITCPInfo) {
    const clients = this.filterClientsBySocket(tcpInfo)
    for (const [clientId] of clients) {
      const { slaveId } = this.unmarshalClientId(clientId)
      this.removeClient({
        host: tcpInfo.host,
        port: tcpInfo.port,
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
      const { host, port } = this.unmarshalSocketId(socketId)
      this.removeSocket({ host, port })
    }
  }

  /**
   * Finds sockets that do not have any clients using it
   */
  private findSocketsWithoutClients () {
    const unusedSocketMap = new Map<SocketId, Socket>()

    for (const [socketId, socket] of this.sockets) {
      const { host, port } = this.unmarshalSocketId(socketId)
      const clients = this.filterClientsBySocket({ host, port })
      if (clients.size === 0) {
        unusedSocketMap.set(socketId, socket)
      }
    }

    return unusedSocketMap
  }

  private marshalSocketId ({ host, port }: ITCPInfo): SocketId {
    return `${host}:${port}`
  }

  private unmarshalSocketId (socketId: SocketId): ITCPInfo {
    const [host, port] = socketId.split(':')
    return {
      host,
      port: parseInt(port, 10)
    }
  }

  private marshalClientId ({ host, port, slaveId }: ITCPSlaveInfo): ClientId {
    return `${host}:${port}.${slaveId}`
  }

  private unmarshalClientId (clientId: ClientId): ITCPSlaveInfo {
    const [host, remainder] = clientId.split(':')
    const [port, slaveId] = remainder.split('.')

    return {
      host,
      port: parseInt(port, 10),
      slaveId: parseInt(slaveId, 10)
    }
  }
}
