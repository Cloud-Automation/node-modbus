// import * as net from 'net';

/// <reference path="codes.d.ts" />

// declare namespace jsmodbus {
//   type MBErrorMessage = 'ILLEGAL FUNCTION' | 'ILLEGAL DATA ADDRESS' | 'ILLEGAL DATA VALUE' | 'SLAVE DEVICE FAILURE' | 'ACKNOWLEDGE' | 'SLAVE DEVICE BUSY' | 'MEMORY PARITY ERROR' | 'GATEWAY PATH UNAVAILABLE' | 'GATEWAY TARGET DEVICE FAILED TO RESPOND'

//   interface MBErrorMessages {
//     1: 'ILLEGAL FUNCTION',
//     2: 'ILLEGAL DATA ADDRESS',
//     3: 'ILLEGAL DATA VALUE',
//     4: 'SLAVE DEVICE FAILURE',
//     5: 'ACKNOWLEDGE',
//     6: 'SLAVE DEVICE BUSY',
//     8: 'MEMORY PARITY ERROR',
//     10: 'GATEWAY PATH UNAVAILABLE',
//     11: 'GATEWAY TARGET DEVICE FAILED TO RESPOND'
//   }

//   type MBErrorCode = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 11;

//   type MBFunctionCode = 1 | 2 | 3 | 4 | 5 | 6 | 15 | 16;

//   //TODO: Find a better way to handle this
//   type SlaveID =
//     1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
//     21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 |
//     39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 |
//     57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 |
//     75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 |
//     93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 |
//     109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 | 121 | 122 | 123 |
//     124 | 125 | 126 | 127 | 128 | 129 | 130 | 131 | 132 | 133 | 134 | 135 | 136 | 137 | 138 |
//     139 | 140 | 141 | 142 | 143 | 144 | 145 | 146 | 147 | 148 | 149 | 150 | 151 | 152 | 153 |
//     154 | 155 | 156 | 157 | 158 | 159 | 160 | 161 | 162 | 163 | 164 | 165 | 166 | 167 | 168 |
//     169 | 170 | 171 | 172 | 173 | 174 | 175 | 176 | 177 | 178 | 179 | 180 | 181 | 182 | 183 |
//     184 | 185 | 186 | 187 | 188 | 189 | 190 | 191 | 192 | 193 | 194 | 195 | 196 | 197 | 198 |
//     199 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 210 | 211 | 212 | 213 |
//     214 | 215 | 216 | 217 | 218 | 219 | 220 | 221 | 222 | 223 | 224 | 225 | 226 | 227 | 228 |
//     229 | 230 | 231 | 232 | 233 | 234 | 235 | 236 | 237 | 238 | 239 | 240 | 241 | 242 | 243 |
//     244 | 245 | 246 | 247 | 248 | 249 | 250 | 251 | 252 | 253 | 254 | 255;

//   /** 
//    * Contains the constructors for new modbus clients
//    * @module jsmodbus/client
//    * */
//   export module client {
//     export const TCP: ModbusTCPClient;
//     export const RTU: ModbusRTUClient;
//   }


//   // WILL DEFINE SERVER WHEN IT IS ACTUALLY USED BY OUR PROJECT
//   /** 
//    * Contains the constructors for new modbus servers
//    * @module jsmodbus/server
//    * */
//   export module server {
//     export const TCP: any;
//     export const RTU: any;
//   }

//   /** This Client musst be initiated with a socket object that implements the event emitter
//    * interface and fires a 'data' event with a buffer as a parameter. It also needs to
//    * implement the 'write' method to send data to the socket.
//    *
//    * @tutorial
//    * ```
//    * let Modbus = require('jsmodbus')
//    * let SerialPort = require('serialport')
//    * let socket = new SerialPort("/dev/tty/ttyUSB0", { "baudRate: 57600" })
//    * let client = new Modbus.client.RTU(socket, address)
//    * ```
//    * @extends ModbusClient
//    * @class
//    */
//   class ModbusRTUClient extends ModbusClient {
//     _requestHandler: ModbusRTUClientRequestHandler;
//     _responseHandler: ModbusRTUClientResponseHandler;
//     /** Creates a new Modbus/RTU Client.
//      * @param {SerialSocket} socket The serial Socket.
//      * @param {Number} address The address of the serial client.
//      */
//     constructor(socket: net.Socket, address: number)
//   }

//   /** This client must be initiated with a net.Socket object. The module does not handle reconnections
//    * or anything related to keep the connection up in case of an unplugged cable or a closed server. See
//    * the node-net-reconnect module for these issues.
//    * @extends ModbusClient
//    * @class
//    * @tutorial
//    * ```
//    * let net = require('net')
//    * let socket = new net.Socket()
//    * let client = new Modbus.tcp.Client(socket)
//    *
//    * socket.connect({'host' : hostname, 'port' : 502 })
//    *
//    * socket.on('connect', function () {
//    *
//    *  client.readCoils(...)
//    *
//    * })
//    * ```
//    */
//   class ModbusTCPClient extends ModbusClient {
//     _unitId: SlaveID;
//     _timeout: number;
//     _requestHandler: ModbusTCPClientRequestHandler;
//     _responseHandler: ModbusTCPClientResponseHandler;
//     isConnected?: boolean;
//     /** Creates a new Modbus/TCP Client.
//      * @param {net.Socket} socket The TCP Socket.
//      * @param {Number} unitId Unit ID between 1 and 255
//      * @param {Number} timeout Timeout for requests in ms.
//      */
//     constructor(socket: net.Socket, unitId?: number, timeout?: number)
//   }

//   /**
//    * Common Modbus Client
//    *
//    * @class ModbusClient
//    */
//   class ModbusClient {
//     _requestHandler: ModbusClientRequestHandler
//     _socket: net.Socket
//     /** Creates a new Modbus client object.
//      * @param {net.Socket} socket A socket object
//      * @throws {NoSocketException}
//      */
//     constructor(socket: net.Socket)

//     /** Execute ReadCoils Request (Function Code 1)
//      * @param {Number} start Start Address.
//      * @param {Number} count Coil Quantity.
//      * @returns {Promise}
//      * @tutorial
//      * ```
//      * client.readCoils(0, 10).then(function (res) {
//      *   console.log(res.response, res.request)
//      * }).catch(function (err) {
//      *   ...
//      * })
//      * ```
//      */
//     readCoils(start: number, count: number): Promise<ReadCoilsResponse>

//     /** Execute ReadDiscreteInputs Request (Function Code 2)
//      * @param {Number} start Start Address.
//      * @param {Number} count Coil Quantity.
//      * @returns {Promise}
//      * @tutorial
//      * ```
//      * client.readDiscreteInputs(0, 10).then(function (res) {
//      *   console.log(res.response, res.request)
//      * }).catch(function (err) {
//      *   ...
//      * })
//      * ```
//      */
//     readDiscreteInputs(start: number, count: number): Promise<ReadDiscreteInputsResponse>

//     /** Execute ReadHoldingRegisters Request (Function Code 3)
//      * @param {Number} start Start Address.
//      * @param {Number} count Coil Quantity.
//      * @returns {Promise}
//      * @tutorial
//      * ```
//      * client.readHoldingRegisters(0, 10).then(function (res) {
//      *   console.log(res.response, res.request)
//      * }).catch(function (err) {
//      *   ...
//      * })
//      * ```
//      */
//     readHoldingRegisters(start: number, count: number): Promise<ReadHoldingRegistersResponse>

//     /** Execute ReadInputRegisters Request (Function Code 4)
//      * @param {Number} start Start Address.
//      * @param {Number} count Coil Quantity.
//      * @returns {Promise}
//      * @tutorial
//      * ```
//      * client.readInputRegisters(0, 10).then(function (res) {
//      *   console.log(res.response, res.request)
//      * }).catch(function (err) {
//      *   ...
//      * })
//      * ```
//      */
//     readInputRegisters(start: number, count: number): Promise<ReadInputRegistersResponse>

//     /** Execute WriteSingleCoil Request (Function Code 5)
//      * @param {Number} address Address.
//      * @param {Boolean} value Value.
//      * @returns {Promise}
//      * @tutorial
//      * ```
//      * client.writeSingleCoil(10, true).then(function (res) {
//      *   console.log(res.response, res.request)
//      * }).catch(function (err) {
//      *   ...
//      * })
//      * ```
//      */
//     writeSingleCoil(address: number, value: boolean): Promise<WriteSingleCoilResponse>

//     /** Execute WriteSingleRegister Request (Function Code 6)
//      * @param {Number} address Address.
//      * @param {Number} value Value.
//      * @returns {Promise}
//      * @tutorial
//      * ```
//      * client.writeSingleRegister(10, 1234).then(function (res) {
//      *   console.log(res.response, res.request)
//      * }).catch(function (err) {
//      *   ...
//      * })
//      * ```
//      */
//     writeSingleRegister(address: number, value: number): Promise<WriteSingleRegisterResponse>

//     /** Execute WriteMultipleCoils Request (Function Code 15)
//      * @param {Number} address Address.
//      * @param {boolean[]|Buffer} values Values either as an Array[Boolean] or a Buffer.
//      * @param {number} [quantity] If you choose to use the Buffer for the values then you have to
//      *   specify the quantity of bytes.
//      * @returns {Promise}
//      * @tutorial
//      * ```
//      * client.writeMultipleCoils(10, [true, false, true, false, true]).then(function (res) {
//      *   console.log(res.response, res.request)
//      * }).catch(function (err) {
//      *   ...
//      * })
//      * ```
//      * @tutorial
//      * ```
//      * client.writeMultipleCoils(10, Buffer.from([0xdd]), 7).then(function (res) {
//      *   console.log(res.response, res.request)
//      * }).catch(function (err) {
//      *   ...
//      * })
//      * ```
//      */
//     writeMultipleCoils(start: number, values: (boolean[] | number[] | Buffer), quantity?: number): Promise<WriteMultipleCoilsResponse>

//     /** Execute WriteMultipleRegisters Request (Function Code 16)
//      * @param {Number} address Address.
//      * @param {Array|Buffer} values Values either as an Array[UInt16] or a Buffer.
//      * @returns {Promise}
//      * @tutorial
//      * ```
//      * client.writeMultipleRegisters(10, [0x1234, 0x5678, 0x9ABC, 0xDEF0]).then(function (res) {
//      *   console.log(res.response, res.request)
//      * }).catch(function (err) {
//      *   ...
//      * })
//      * ```
//      * @tutorial
//      * ```
//      * client.writeMultipleRegisters(10, Buffer.from([0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC, 0xDE, 0xF0])).then(function (res) {
//      *   console.log(res.response, res.request)
//      * }).catch(function (err) {
//      *   ...
//      * })
//      * ```
//      */
//     writeMultipleRegisters(start: number, values: Uint16Array | number[] | boolean[]): Promise<WriteMultipleRegistersResponse>
//   }


//   /** TCP Client Request Handler
//    * Implements the behaviour for Client Requests for Modbus/TCP.
//    * @extends ModbusClientRequestHandler
//    * @class
//    */
//   class ModbusTCPClientRequestHandler extends ModbusClientRequestHandler {
//     _requestId: number;
//     _unitId: number;

//     /** Create a new TCPClientRequestHandler
//      * @param {net.Socket} socket net.Socket
//      * @param {Number} unitId Unit ID
//      * @param {Number} timeout Timeout in ms for requests
//      */
//     constructor(socket: net.Socket, unitId?: number, timeout?: number)
//   }

//   /**
//    *  Modbus/RTU Client Request Handler
//    * Implements behaviour for Client Requests for Modbus/RTU
//    *
//    * @class ModbusRTUClientRequestHandler
//    * @extends {ModbusClientRequestHandler}
//    */
//   class ModbusRTUClientRequestHandler extends ModbusClientRequestHandler {
//     private _address: string;
//     /**
//      *Creates an instance of ModbusRTUClientRequestHandler.
//      * @param {net.Socket} socket Any serial Socket that implements the serialport interface
//      * @param {string} address The serial address of the modbus slave
//      * @memberof ModbusRTUClientRequestHandler
//      */
//     constructor(socket: net.Socket, address: string)

//   }


//   /** Common Request Handler
//    * @abstract
//    */
//   class ModbusClientRequestHandler {
//     /**
//      *
//      *
//      * @type {net.Socket}
//      * @memberof ModbusClientRequestHandler
//      */
//     _socket: net.Socket;
//     _timeout: number;
//     _requests: UserRequest[];
//     _currentRequest: UserRequest;
//     _state: 'online' | 'offline';

//     /** Create a new Request handler for Client requests
//      * @param {net.Socket} socket A net.Socket object.
//      * @param {Number} timeout The request timeout value in ms.
//      */
//     constructor(socket: net.Socket, timeout?: number)

//     _clearCurrentRequest(): void
//     _clearAllRequests(): void
//     _onConnect(): void
//     _onClose(): void

//     /** Register a new request.
//      * @param {ModbusTCPRequest} requestBody A request body to execute a modbus function.
//      * @returns {Promise} A promise to handle the request outcome.
//      */
//     register(request: ModbusTCPRequest<ModbusRequestBody<MBFunctionCode>>): UserRequest["promise"]

//     /** Handle a ModbusTCPResponse object.
//      * @param {ModbusTCPResponse} response A Modbus TCP Response.
//      */
//     handle(response: ModbusTCPResponse<AnyModbusResponseBody>): void
//     /** execute next request */
//     _flush(): void
//   }



//   class ModbusClientResponseHandler<T> {
//     private _buffer: Buffer;
//     private _messages: T[];

//     /**
//      *Creates an instance of ModbusClientResponseHandler.
//      * @memberof ModbusClientResponseHandler
//      */
//     constructor()
//     /** Process new incoming data and enqueue new modbus responses.
//      * @param {Buffer} data New incoming data from the socket.
//      */
//     handleData(data: Buffer): any
//     /**
//      * Extract latest Modbus Response.
//      *
//      * @memberof ModbusClientResponseHandler
//      */
//     shift(): T;
//   }

//   class ModbusTCPClientResponseHandler extends ModbusClientResponseHandler<ModbusTCPResponse<AnyModbusResponseBody>> {

//   }

//   class ModbusRTUClientResponseHandler extends ModbusClientResponseHandler<ModbusRTUResponse<AnyModbusResponseBody>> {

//   }


//   /** Class representing a Modbus TCP Request */
//   class ModbusTCPRequest<T extends ModbusRequestBody<MBFunctionCode>> {
//     /** Convert a buffer into a new Modbus TCP Request. Returns null if the buffer
//      * does not contain enough data.
//      * @static
//      * @param {Buffer} buffer
//      * @return {ModbusTCPRequest} A new Modbus TCP Request or Null.
//      */
//     static fromBuffer(buffer: Buffer): ModbusTCPRequest<ModbusRequestBody<MBFunctionCode>>

//     private _id: number;
//     private _protocol: number;
//     private _length: number;
//     private _unitId: number;
//     private _body: T;

//     /**
//      *Creates an instance of ModbusTCPRequest.
//      * @param {number} id Transaction ID
//      * @param {number} protocol Protocol Type
//      * @param {number} length Byte count of the following data (inc. unitId)
//      * @param {number} unitId Unit ID
//      * @param {ModbusRequestBody} body Actual modbus request containing function code and parameters.
//      * @memberof ModbusTCPRequest
//      */
//     constructor(id: number, protocol: number, length: number, unitId: number, body: T)

//     /**
//      *
//      *
//      * @readonly
//      * @type {ModbusTCPRequest["_id"]}
//      * @memberof ModbusTCPRequest
//      */
//     readonly id: ModbusTCPRequest<T>["_id"]
//     /**
//      *
//      *
//      * @readonly
//      * @type {ModbusTCPRequest["_protocol"]}
//      * @memberof ModbusTCPRequest
//      */
//     readonly protocol: ModbusTCPRequest<T>["_protocol"];
//     /**
//      *
//      *
//      * @readonly
//      * @type {ModbusTCPRequest["_length"]}
//      * @memberof ModbusTCPRequest
//      */
//     readonly length: ModbusTCPRequest<T>["_length"];
//     /**
//      *
//      *
//      * @readonly
//      * @type {ModbusTCPRequest["_unitId"]}
//      * @memberof ModbusTCPRequest
//      */
//     readonly unitId: ModbusTCPRequest<T>["_unitId"];
//     /**
//      *
//      *
//      * @readonly
//      * @type {ModbusTCPRequest["_body"]}
//      * @memberof ModbusTCPRequest
//      */
//     readonly body: ModbusTCPRequest<T>["_body"];
//     /**
//      *
//      *
//      * @readonly
//      * @type {ModbusTCPRequest["_name"]}
//      * @memberof ModbusTCPRequest
//      */
//     readonly name: ModbusTCPRequest<T>["_body"]["name"];
//     /**
//      *
//      *
//      * @readonly
//      * @type {false}
//      * @memberof ModbusTCPRequest
//      */
//     readonly corrupted: false
//     /**
//      * Creates a buffer object representing the modbus tcp request.
//      *
//      * @returns {Buffer}
//      * @memberof ModbusTCPRequest
//      */
//     createPayload(): Buffer
//     /**
//      * The calculated byte count of the byte representation
//      *
//      * `this._length + 6`
//      *
//      * @readonly
//      * @type {number}
//      * @memberof ModbusTCPRequest
//      */
//     readonly byteCount: number
//   }

//   class ModbusTCPResponse<T extends ModbusResponseBody> {
//     _id: number;
//     _protocol: number;
//     _bodyLength: number;
//     _unitId: number;
//     _body: T;

//     /**
//      * Create new Modbus/TCP Response Object.
//      * @param {number} id  Transaction ID
//      * @param {number} protocol  Protcol version (Usually 0)
//      * @param {number} bodyLength  Body length + 1
//      * @param {SlaveID} unitId  Unit ID
//      * @param {T} body  Modbus response body object
//      * @memberof ModbusTCPResponse
//      */
//     constructor(id: number, protocol: number, bodyLength: number, unitId: SlaveID, body: T)
//     public readonly id: ModbusTCPResponse<T>['_id'];
//     public readonly protocol: ModbusTCPResponse<T>['_protocol'];
//     public readonly bodyLength: ModbusTCPResponse<T>['_bodyLength'];
//     public readonly byteCount: number;
//     public readonly unitId: ModbusTCPResponse<T>['_unitId'];
//     public readonly body: ModbusTCPResponse<T>['_body'];

//   }

//   class ModbusRTUResponse<T> {
//     private _address: any;
//     private _crc: number;
//     private _body: AnyModbusResponseBody;
//     constructor(address: any, crc: number, body: AnyModbusResponseBody)

//     public readonly address: ModbusRTUResponse<T>["_address"];
//     public readonly crc: ModbusRTUResponse<T>["_crc"];
//     public readonly body: ModbusRTUResponse<T>["_body"];
//     public readonly byteCount: ModbusRTUResponse<T>["_body"]["byteCount"];
//     /**
//      * Payload is a buffer with:
//      * 
//      * `Address/Unit ID` = 1 Byte,
//      * `Body` = N Bytes,
//      * `CRC` = 2 Bytes
//      *
//      * @returns {Buffer}
//      * @memberof ModbusRTUResponse
//      */
//     public createPayload(): Buffer
//   }

//   type ModbusRequestBodyName = 'ReadCoils' | 'ReadDiscreteInput' | 'ReadHoldingRegisters' | 'ReadInputRegisters' | 'WriteMultipleCoils' | 'WriteMultipleRegisters' | 'WriteSingleCoil' | 'WriteSingleRegister'

//   /** Common Modbus Request Body
//    * @abstract
//    */
//   class ModbusRequestBody<T extends MBFunctionCode> {

//     readonly name: ModbusRequestBodyName;
//     _fc: T

//     /** Create a Modbus Request Body from a buffer object. Depending on the function code
//      * in the buffer the request body could by any function codes request body.
//      * @param {Buffer} buffer The buffer to be parsed.
//      * @returns {ModbusRequestBody} The actual request body or null if there is not enough data in the buffer.
//      */
//     static fromBuffer(buffer: Buffer): ModbusRequestBody<MBFunctionCode> | ExceptionRequestBody | null

//     /** Creates a new Common Modbus Request Body. Do not use this, use the actual request body
//      * @param {MBFunctionCode} fc Function Code
//      */
//     constructor(fc: T)

//     /**
//      * Function Code
//      *
//      * @readonly
//      * @type {MBFunctionCode}
//      * @memberof ModbusRequestBody
//      */
//     readonly fc: ModbusRequestBody<T>["_fc"]

//     createPayload(): void
//   }

//   /** Write Single Coil Request Body
//    * @extends ModbusRequestBody
//    */
//   class ExceptionRequestBody extends ModbusRequestBody<MBFunctionCode> {
//     _code: MBErrorCode

//     /**
//      *
//      *
//      * @static
//      * @param {Buffer} buffer
//      * @returns {(ExceptionRequestBody | null)}
//      * @memberof ExceptionRequestBody
//      */
//     static fromBuffer(buffer: Buffer): ExceptionRequestBody | null

//     /**
//      * Creates an instance of ExceptionRequestBody.
//      * @param {MBFunctionCode} fc related function code.
//      * @param {MBErrorCode} code exception code.
//      * @memberof ExceptionRequestBody
//      */
//     constructor(fc: MBFunctionCode, code: MBErrorCode)

//     /**
//      * Address to be written
//      *
//      * @readonly
//      * @type {ExceptionRequestBody["_code"]}
//      * @memberof ExceptionRequestBody
//      */
//     code(): ExceptionRequestBody["_code"]

//     /**
//      *
//      *
//      * @returns {Buffer}
//      * @memberof ExceptionRequestBody
//      */
//     createPayload(): Buffer

//     /**
//      * Returns the byte count of this request for the byte representation.
//      *
//      * @readonly
//      * @type {2}
//      * @memberof ExceptionRequestBody
//      */
//     readonly byteCount: 2

//   }

//   class ReadCoilsRequestBody extends ModbusRequestBody<1> {
//     static fromBuffer(buffer: Buffer): ReadCoilsRequestBody | null

//     private _start: number;
//     private _count: number;
//     /** Create a new Read Coils Request Body.
//      * @param {Number} start Start Address.
//      * @param {Number} count Quantity of coils to be read.
//      * @throws {InvalidStartAddressException} When Start address is larger than 0xFFFF.
//      * @throws {InvalidQuantityException} When count is larger than 0x7D0.
//      */
//     constructor(start: number, count: number)

//     /**
//      * Start Address.
//      *
//      * @type {number}
//      * @memberof ReadCoilsRequestBody
//      */
//     readonly start: ReadCoilsRequestBody['_start']
//     /**
//      * Quantity of coils to be read.
//      *
//      * @type {number}
//      * @memberof ReadCoilsRequestBody
//      */
//     readonly count: ReadCoilsRequestBody['_count'];
//     /**
//      *
//      *
//      * @type {'ModbusRequestBodyName'}
//      * @memberof ReadCoilsRequestBody
//      */
//     readonly name: 'ReadCoils';
//     /**
//      *
//      *
//      * @returns {Buffer}
//      * @memberof ReadCoilsRequestBody
//      */
//     createPayload(): Buffer
//     /**
//      *
//      *
//      * @memberof ReadCoilsRequestBody
//      */
//     readonly byteCount: 5
//   }

//   class ReadDiscreteInputsRequestBody extends ModbusRequestBody<2> {
//     static fromBuffer(buffer: Buffer): ReadDiscreteInputsRequestBody | null

//     private _start: number;
//     private _count: number;

//     /** Create a new Read Discrete Inputs Request Body.
//      * @param {Number} start Start Address.
//      * @param {Number} count Quantity of coils to be read.
//      * @throws {InvalidStartAddressException} When Start address is larger than 0xFFFF.
//      * @throws {InvalidQuantityException} When count is larger than 0x7D0.
//      */
//     constructor(start: number, count: number)

//     /**
//      * Start Address.
//      *
//      * @type {number}
//      * @memberof ReadDiscreteInputsRequestBody
//      */
//     readonly start: ReadDiscreteInputsRequestBody['_start']
//     /**
//      * Quantity of input registers to be read.
//      *
//      * @type {number}
//      * @memberof ReadDiscreteInputsRequestBody
//      */
//     readonly count: ReadDiscreteInputsRequestBody['_count'];
//     /**
//      *
//      *
//      * @type {'ModbusRequestBodyName'}
//      * @memberof ReadDiscreteInputsRequestBody
//      */
//     readonly name: 'ReadDiscreteInput';
//     /**
//      *
//      *
//      * @returns {Buffer}
//      * @memberof ReadDiscreteInputsRequestBody
//      */
//     createPayload(): Buffer
//     /**
//      *
//      *
//      * @memberof ReadDiscreteInputsRequestBody
//      */
//     readonly byteCount: 5
//   }

//   class ReadHoldingRegistersRequestBody extends ModbusRequestBody<3> {
//     static fromBuffer(buffer: Buffer): ReadHoldingRegistersRequestBody | null

//     private _start: number;
//     private _count: number;

//     /** Create a new Read Holding Registers Request Body.
//      * @param {Number} start Start Address.
//      * @param {Numer} count Quantity of registers to be read.
//      * @throws {InvalidStartAddressException} When start address is larger than 0xFFFF.
//      * @throws {InvalidQuantityException} When count is larger than 0x7D0.
//      */
//     constructor(start: number, count: number)

//     /**
//      * Start Address.
//      *
//      * @type {number}
//      * @memberof ReadHoldingRegistersRequestBody
//      */
//     readonly start: ReadHoldingRegistersRequestBody['_start']
//     /**
//      * Quantity of input registers to be read.
//      *
//      * @type {number}
//      * @memberof ReadHoldingRegistersRequestBody
//      */
//     readonly count: ReadHoldingRegistersRequestBody['_count'];
//     /**
//      *
//      *
//      * @type {'ModbusRequestBodyName'}
//      * @memberof ReadHoldingRegistersRequestBody
//      */
//     readonly name: 'ReadHoldingRegisters';
//     /**
//      *
//      *
//      * @returns {Buffer}
//      * @memberof ReadHoldingRegistersRequestBody
//      */
//     createPayload(): Buffer
//     /**
//      *
//      *
//      * @memberof ReadHoldingRegistersRequestBody
//      */
//     readonly byteCount: 5
//   }

//   class ReadInputRegistersRequestBody extends ModbusRequestBody<4> {
//     static fromBuffer(buffer: Buffer): ReadInputRegistersRequestBody | null

//     private _start: number;
//     private _count: number;

//     /** Create a new Read Input Registers Request Body.
//      * @param {Number} start Start Address.
//      * @param {Number} count Quantity of coils to be read.
//      * @throws {InvalidStartAddressException} When Start address is larger than 0xFFFF.
//      * @throws {InvalidQuantityException} When count is larger than 0x7D0.
//      */
//     constructor(start: number, count: number)

//     /**
//      * Start Address.
//      *
//      * @type {number}
//      * @memberof ReadInputRegistersRequestBody
//      */
//     readonly start: ReadInputRegistersRequestBody['_start']
//     /**
//      * Quantity of input registers to be read.
//      *
//      * @type {number}
//      * @memberof ReadInputRegistersRequestBody
//      */
//     readonly count: ReadInputRegistersRequestBody['_count'];
//     /**
//      *
//      *
//      * @type {'ModbusRequestBodyName'}
//      * @memberof ReadInputRegistersRequestBody
//      */
//     readonly name: 'ReadInputRegisters';
//     /**
//      *
//      *
//      * @returns {Buffer}
//      * @memberof ReadInputRegistersRequestBody
//      */
//     createPayload(): Buffer
//     /**
//      *
//      *
//      * @memberof ReadInputRegistersRequestBody
//      */
//     readonly byteCount: 5
//   }

//   class WriteMultipleCoilsRequestBody extends ModbusRequestBody<15> {
//     static fromBuffer(buffer: Buffer): WriteMultipleCoilsRequestBody | null

//     private _address: number;
//     private _values: Boolean[] | Buffer;
//     private _quantity: number;
//     private _valuesAsBuffer: Buffer;
//     private _byteCount: number;
//     private _valuesAsArray: Boolean[];
//     private _numberOfBytes: number;

//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteMultipleCoilsRequestBody
//      */
//     readonly address: WriteMultipleCoilsRequestBody['_address'];
//     /**
//      *
//      *
//      * @type {(Boolean[] | Buffer)}
//      * @memberof WriteMultipleCoilsRequestBody
//      */
//     readonly values: WriteMultipleCoilsRequestBody['_values'];
//     /**
//      *
//      *
//      * @type {Boolean[]}
//      * @memberof WriteMultipleCoilsRequestBody
//      */
//     readonly valuesAsArray: WriteMultipleCoilsRequestBody['_valuesAsArray'];
//     /**
//      *
//      *
//      * @type {Buffer}
//      * @memberof WriteMultipleCoilsRequestBody
//      */
//     readonly valuesAsBuffer: WriteMultipleCoilsRequestBody['_valuesAsBuffer'];
//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteMultipleCoilsRequestBody
//      */
//     readonly quantity: WriteMultipleCoilsRequestBody['_quantity'];
//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteMultipleCoilsRequestBody
//      */
//     readonly byteCount: WriteMultipleCoilsRequestBody['_byteCount'];
//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteMultipleCoilsRequestBody
//      */
//     readonly numberOfBytes: WriteMultipleCoilsRequestBody['_numberOfBytes']
//     /**
//      *
//      *
//      * @type {'ModbusRequestBodyName'}
//      * @memberof WriteMultipleCoilsRequestBody
//      */
//     readonly name: 'WriteMultipleCoils'

//     /** Create a new Write Multiple Coils Request Body.
//      * @param {number} address Write address.
//      * @param {(Boolean[] | Buffer)} values Values to be written. Either a Array of Boolean values or a Buffer.
//      * @param {number} [quantity] In case of values being a Buffer, specify the number of coils that needs to be written.
//      * @throws {InvalidStartAddressException} When address is larger than 0xFFFF.
//      * @throws {InvalidArraySizeException}
//      * @throws {InvalidBufferSizeException}
//      * @memberof WriteMultipleCoilsRequestBody
//      */
//     constructor(address: number, values: Boolean[] | Buffer, quantity?: number)

//     /**
//      *
//      *
//      * @returns {Buffer}
//      * @memberof WriteMultipleCoilsRequestBody
//      */
//     createPayload(): Buffer

//   }

//   class WriteMultipleRegistersRequestBody extends ModbusRequestBody<16> {
//     static fromBuffer(buffer: Buffer): WriteMultipleRegistersRequestBody | null

//     private _address: number;
//     private _values: Uint16Array | number[] | Buffer;
//     private _quantity: number;
//     private _valuesAsBuffer: Buffer;
//     private _byteCount: number;
//     private _valuesAsArray: Boolean[];
//     private _numberOfBytes: number;

//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteMultipleRegistersRequestBody
//      */
//     readonly address: WriteMultipleRegistersRequestBody['_address'];
//     /**
//      *
//      *
//      * @type {(Uint16Array | number[] | Buffer)}
//      * @memberof WriteMultipleRegistersRequestBody
//      */
//     readonly values: WriteMultipleRegistersRequestBody['_values'];
//     /**
//      *
//      *
//      * @type {Boolean[]}
//      * @memberof WriteMultipleRegistersRequestBody
//      */
//     readonly valuesAsArray: WriteMultipleRegistersRequestBody['_valuesAsArray'];
//     /**
//      *
//      *
//      * @type {Buffer}
//      * @memberof WriteMultipleRegistersRequestBody
//      */
//     readonly valuesAsBuffer: WriteMultipleRegistersRequestBody['_valuesAsBuffer'];
//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteMultipleRegistersRequestBody
//      */
//     readonly quantity: WriteMultipleRegistersRequestBody['_quantity'];
//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteMultipleRegistersRequestBody
//      */
//     readonly byteCount: WriteMultipleRegistersRequestBody['_byteCount'];
//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteMultipleRegistersRequestBody
//      */
//     readonly numberOfBytes: WriteMultipleRegistersRequestBody['_numberOfBytes']
//     /**
//      *
//      *
//      * @type {'ModbusRequestBodyName'}
//      * @memberof WriteMultipleRegistersRequestBody
//      */
//     readonly name: 'WriteMultipleRegisters'

//     /** Create a new Write Multiple Registers Request Body.
//      * @param {Number} address Write address.
//      * @param {Uint16Array | Number[] | Buffer} values Values to be written. Either a Array of UInt16 values or a Buffer.
//      * @param {Uint16Array} quantity In case of values being a Buffer, specify the number of coils that needs to be written.
//      * @throws {InvalidStartAddressException} When address is larger than 0xFFFF.
//      * @throws {InvalidArraySizeException}
//      * @throws {InvalidBufferSizeException}
//      */
//     constructor(address: number, values: Uint16Array | number[] | Buffer, quantity?: number)

//     /**
//      *
//      *
//      * @returns {Buffer}
//      * @memberof WriteMultipleRegistersRequestBody
//      */
//     createPayload(): Buffer

//   }

//   class WriteSingleCoilRequestBody extends ModbusRequestBody<5> {
//     static fromBuffer(buffer: Buffer): WriteSingleCoilRequestBody | null

//     private _address: number;
//     private _value: boolean;

//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteSingleCoilRequestBody
//      */
//     readonly address: WriteSingleCoilRequestBody['_address'];
//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteSingleRegisterRequestBody
//      */
//     readonly value: WriteSingleCoilRequestBody['_value'];
//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteSingleCoilRequestBody
//      */
//     readonly byteCount: 5;
//     /**
//      *
//      *
//      * @type {'ModbusRequestBodyName'}
//      * @memberof WriteSingleCoilRequestBody
//      */
//     readonly name: 'WriteSingleCoil'

//     /** Create a new Write Single Coil Request Body.
//      * @param {Number} address Write address.
//      * @param {Boolean} value Value to be written.
//      * @throws {InvalidStartAddressException} When address is larger than 0xFFFF.
//      */
//     constructor(address: number, value: boolean)
//     /**
//      *
//      *
//      * @returns {Buffer}
//      * @memberof WriteSingleCoilRequestBody
//      */
//     createPayload(): Buffer

//   }

//   class WriteSingleRegisterRequestBody extends ModbusRequestBody<5> {
//     static fromBuffer(buffer: Buffer): WriteSingleRegisterRequestBody | null

//     private _address: number;
//     private _value: number;

//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteSingleRegisterRequestBody
//      */
//     readonly address: WriteSingleRegisterRequestBody['_address'];
//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteSingleRegisterRequestBody
//      */
//     readonly value: WriteSingleRegisterRequestBody['_value'];
//     /**
//      *
//      *
//      * @type {number}
//      * @memberof WriteSingleRegisterRequestBody
//      */
//     readonly byteCount: 5;
//     /**
//      *
//      *
//      * @type {'ModbusRequestBodyName'}
//      * @memberof WriteSingleRegisterRequestBody
//      */
//     readonly name: 'WriteSingleRegister'

//     /** Create a new Write Single Register Request Body.
//      * @param {Number} address Write address.
//      * @param {Number} value Value to be written.
//      * @throws {InvalidStartAddressException} When address is larger than 0xFFFF.
//      */
//     constructor(address: number, value: number)
//     /**
//      *
//      *
//      * @returns {Buffer}
//      * @memberof WriteSingleRegisterRequestBody
//      */
//     createPayload(): Buffer

//   }



//   class ModbusResponseBody {
//     _fc: MBFunctionCode;
//     /**
//      * Function code of the response
//      *
//      * @type {MBFunctionCode}
//      * @memberof ModbusResponseBody
//      */
//     public readonly fc: MBFunctionCode;
//     public readonly byteCount: number;
//     public createPayload(): never;
//   }
//   class ExceptionResponseBody extends ModbusResponseBody {
//     _code: MBErrorCode;
//     /**
//      * The Modbus Error Code
//      *
//      * @type {MBErrorCode}
//      * @memberof ExceptionResponseBody
//      */
//     public code: MBErrorCode;
//     public readonly message: MBErrorMessages[ExceptionResponseBody["code"]];
//     /** Create ExceptionResponseBody
//      * @param {Number} fc Function Code
//      * @param {Number} code Exception Code
//      */
//     constructor(fc: MBFunctionCode, code: MBErrorCode)
//   }
//   class ReadCoilsResponseBody extends ModbusResponseBody {
//     _fc: 1;
//     public readonly fc: 1;
//     private _coils: boolean[] | Buffer
//     private _numberOfBytes: number;
//     private _valuesAsArray: boolean[]
//     private _valuesAsBuffer: Buffer
//     public readonly values: ReadCoilsResponseBody["_coils"];
//     public readonly valuesAsArray: ReadCoilsResponseBody["_valuesAsArray"];
//     public readonly valuesAsBuffer: ReadCoilsResponseBody["_valuesAsBuffer"];
//     public readonly numberOfBytes: ReadCoilsResponseBody["_numberOfBytes"];
//     public readonly byteCount: ReadCoilsResponseBody["_numberOfBytes"];
//     /**
//      * Create new ReadCoilsResponseBody
//      * @param {boolean[]} coils
//      * @param {number} numberOfBytes
//      * @memberof ReadCoilsResponseBody
//      */
//     constructor(coils: boolean[] | Buffer, numberOfBytes: number)

//   }
//   class ReadDiscreteInputsBody extends ModbusResponseBody {
//     _fc: 2;
//     public readonly fc: ReadDiscreteInputsBody["_fc"];
//     private _discrete: boolean[] | Buffer;
//     private _numberOfBytes: number;
//     private _valuesAsArray: boolean[];
//     private _valuesAsBuffer: Buffer;
//     /** Creates a ReadDiscreteInputsResponseBody
//      * @param {boolean[]} discrete Array with Boolean values
//      * @param {Number} length Quantity of Coils
//      * @memberof ReadDiscreteInputsBody
//      */
//     constructor(discrete: boolean[], numberOfBytes: number)
//     public readonly discrete: boolean[] | Buffer;
//     public readonly valuesAsArray: boolean[];
//     public readonly valuesAsBuffer: Buffer
//     public readonly numberOfBytes: number;
//     public readonly byteCount: number;
//   }
//   class ReadHoldingRegistersBody extends ModbusResponseBody {
//     _fc: 3;
//     private _byteCount: number;
//     private _values: number[] | Buffer;
//     private _bufferLength: number;
//     private _valuesAsArray: boolean[];
//     private _valuesAsBuffer: Buffer;
//     public readonly fc: ReadHoldingRegistersBody["_fc"];
//     /**
//      *Creates an instance of ReadHoldingRegistersBody.
//      * @param {number} byteCount number of bytes to read
//      * @param {(number[] | Buffer)} values registers to read
//      * @memberof ReadHoldingRegistersBody
//      */
//     constructor(byteCount: number, values: number[] | Buffer)

//     public readonly byteCount: ReadHoldingRegistersBody['_bufferLength']
//     public readonly values: ReadHoldingRegistersBody['_values'];
//     public readonly valuesAsArray: number[];
//     public readonly valuesAsBuffer: Buffer;
//     public readonly length: number;
//   }
//   class ReadInputRegistersBody extends ModbusResponseBody {
//     _fc: 4;
//     private _byteCount: number;
//     private _values: number[] | Buffer;
//     private _bufferLength: number;
//     private _valuesAsArray: boolean[];
//     private _valuesAsBuffer: Buffer;

//     public readonly fc: ReadInputRegistersBody["_fc"];
//     /**
//      * Creates an instance of ReadInputRegistersBody.
//      * @param {number} byteCount number of bytes to read
//      * @param {(number[] | Buffer)} values registers to read
//      * @memberof ReadInputRegistersBody
//      */
//     constructor(byteCount: number, values: number[] | Buffer)

//     public readonly byteCount: ReadInputRegistersBody['_bufferLength']
//     public readonly values: ReadInputRegistersBody['_values'];
//     public readonly valuesAsArray: number[];
//     public readonly valuesAsBuffer: Buffer;
//     public readonly length: number;
//   }
//   class WriteSingleCoilBody extends ModbusResponseBody {
//     _fc: 5;
//     private _address: number;
//     private _value: boolean;
//     public readonly fc: WriteSingleCoilBody["_fc"];
//     /**
//      *Creates an instance of WriteSingleCoilBody.
//      * @param {number} address the coil to write to
//      * @param {boolean} value the value to write to
//      * @memberof WriteSingleCoilBody
//      */
//     constructor(address: number, value: boolean)

//     public readonly address: WriteSingleCoilBody["_address"];
//     public readonly value: WriteSingleCoilBody["_value"];
//     public readonly byteCount: 5
//   }
//   class WriteSingleRegisterBody extends ModbusResponseBody {
//     _fc: 6;
//     private _address: number;
//     private _value: number;
//     public readonly fc: WriteSingleRegisterBody["_fc"];
//     /**
//      *Creates an instance of WriteSingleRegisterBody.
//      * @param {number} address the coil to write to
//      * @param {number} value the value to write to
//      * @memberof WriteSingleRegisterBody
//      */
//     constructor(address: number, value: number)

//     public readonly address: WriteSingleRegisterBody["_address"];
//     public readonly value: WriteSingleRegisterBody["_value"];
//     public readonly byteCount: 5
//   }
//   class WriteMultipleCoilsBody extends ModbusResponseBody {
//     _fc: 15;
//     private _start: number;
//     private _quantity: number;
//     public readonly fc: WriteMultipleCoilsBody["_fc"];
//     /**
//      * Creates an instance of WriteMultipleCoilsBody.
//      * @param {number} start starting address
//      * @param {number} quantity number of addresses to read
//      * @memberof WriteMultipleCoilsBody
//      */
//     constructor(start: number, quantity: number)
//     public start: WriteMultipleCoilsBody['_start'];
//     public quantity: WriteMultipleCoilsBody['_quantity'];
//     public readonly byteCount: 5
//   }
//   class WriteMultipleRegistersBody extends ModbusResponseBody {
//     _fc: 16;
//     private _start: number;
//     private _quantity: number;
//     public readonly fc: WriteMultipleRegistersBody["_fc"];
//     /**
//      * Creates an instance of WriteMultipleRegistersBody.
//      * @param {number} start starting address
//      * @param {number} quantity number of addresses to read
//      * @memberof WriteMultipleRegistersBody
//      */
//     constructor(start: number, quantity: number)
//     public start: WriteMultipleRegistersBody['_start'];
//     public quantity: WriteMultipleRegistersBody['_quantity'];
//     public readonly byteCount: 5
//   }



//   class Response<T> {
//     _head: any;
//     _body: T;
//     head: any;
//     body: T;
//     length: number;
//   }

//   interface UserRequestPromiseResolve<Res extends ModbusResponseBody, Req extends ModbusRequestBody<MBFunctionCode>> {
//     response: ModbusTCPResponse<Res>;
//     request: ModbusTCPRequest<Req>;
//   }

//   interface ReadCoilsResponse extends UserRequestPromiseResolve<ReadCoilsResponseBody, ReadCoilsRequestBody> { }
//   interface ReadDiscreteInputsResponse extends UserRequestPromiseResolve<ReadDiscreteInputsBody, ReadDiscreteInputsRequestBody> { }
//   interface ReadHoldingRegistersResponse extends UserRequestPromiseResolve<ReadHoldingRegistersBody, ReadHoldingRegistersRequestBody> { }
//   interface ReadInputRegistersResponse extends UserRequestPromiseResolve<ReadInputRegistersBody, ReadInputRegistersRequestBody> { }

//   type UserReadRequestPromiseResolveAny = ReadCoilsResponse | ReadDiscreteInputsResponse | ReadHoldingRegistersResponse | ReadInputRegistersResponse

//   interface WriteMultipleCoilsResponse extends UserRequestPromiseResolve<WriteMultipleCoilsBody, WriteMultipleCoilsRequestBody> { }
//   interface WriteMultipleRegistersResponse extends UserRequestPromiseResolve<WriteMultipleRegistersBody, WriteMultipleRegistersRequestBody> { }
//   interface WriteSingleCoilResponse extends UserRequestPromiseResolve<WriteSingleCoilBody, WriteSingleCoilRequestBody> { }
//   interface WriteSingleRegisterResponse extends UserRequestPromiseResolve<WriteSingleRegisterBody, WriteSingleRegisterRequestBody> { }

//   type UserWriteRequestPromiseResolveAny = WriteMultipleCoilsResponse | WriteMultipleRegistersResponse | WriteSingleCoilResponse | WriteSingleRegisterResponse

//   type UserAnyRequestPromiseResolve = UserReadRequestPromiseResolveAny | UserWriteRequestPromiseResolveAny

//   type AnyModbusReadResponse = ReadCoilsResponseBody | ReadDiscreteInputsBody | ReadHoldingRegistersBody | ReadInputRegistersBody;
//   type AnyModbusWriteResponse = WriteSingleCoilBody | WriteSingleRegisterBody | WriteMultipleCoilsBody | WriteMultipleRegistersBody;
//   type AnyModbusResponseBody = AnyModbusReadResponse | AnyModbusWriteResponse;



//   type AnyModbusReadRequest = ReadCoilsRequestBody | ReadDiscreteInputsRequestBody | ReadHoldingRegistersRequestBody | ReadInputRegistersRequestBody
//   type AnyModbusWriteRequest = WriteMultipleCoilsRequestBody | WriteMultipleRegistersRequestBody | WriteSingleCoilRequestBody | WriteSingleRegisterRequestBody
//   type AnyModbusRequestBody = AnyModbusReadRequest | AnyModbusWriteRequest;

//   interface ErrorResponseBody {
//     err: 'OutOfSync' | 'Protocol' | 'Timeout' | 'ManuallyCleared' | 'ModbusException' | 'Offline' | 'crcMismatch';
//     message: string;
//   }

//   interface UserReadRequestPromiseModbusException extends UserRequestPromiseResolve<ExceptionResponseBody, AnyModbusReadRequest> { }
//   interface UserWriteRequestPromiseModbusException extends UserRequestPromiseResolve<ExceptionResponseBody, AnyModbusWriteRequest> { }
//   type UserRequestPromiseModbusException = UserReadRequestPromiseModbusException | UserWriteRequestPromiseModbusException;
//   type UserRequestPromiseReject = UserRequestPromiseModbusException | ErrorResponseBody;

//   /** Request created for the user. It contains the actual modbus request,
//    * the timeout handler and the promise delivered from the readCoils method
//    * in the client.
//    * @class
//    */
//   class UserRequest {
//     _request: ModbusRequestBody<MBFunctionCode>;
//     _timeout: number;
//     /**
//      * Creates an instance of UserRequest.
//      * @param {ModbusRequestBody} request
//      * @param {number} [timeout]
//      * @memberof UserRequest
//      */
//     constructor(request: ModbusRequestBody<MBFunctionCode>, timeout?: number)

//     /**
//      *
//      *
//      * @readonly
//      * @type {(Promise<UserAnyRequestPromiseResolve>)}
//      * @memberof UserRequest
//      */
//     promise(): Promise<UserAnyRequestPromiseResolve | UserRequestPromiseReject>

//     /**
//      *
//      *
//      * @returns {ModbusRequestBody["createPayload"]}
//      * @memberof UserRequest
//      */
//     createPayload(): ModbusRequestBody<MBFunctionCode>["createPayload"];

//     /**
//      *
//      *
//      * @param {Function} cb
//      * @memberof UserRequest
//      */
//     start(cb: Function): void

//     /**
//      *
//      *
//      * @memberof UserRequest
//      */
//     done(): void;

//     /**
//      *
//      *
//      * @readonly
//      * @type {ModbusRequestBody}
//      * @memberof UserRequest
//      */
//     request(): ModbusRequestBody<MBFunctionCode>
//     /**
//      *
//      *
//      * @readonly
//      * @type {number}
//      * @memberof UserRequest
//      */
//     timeout(): number

//     /**
//      *
//      *
//      * @returns {UserAnyRequestPromiseResolve}
//      * @memberof UserRequest
//      */
//     resolve(): UserAnyRequestPromiseResolve

//     /**
//      *
//      *
//      * @readonly
//      * @type {UserRequestPromiseReject}
//      * @memberof UserRequest
//      */
//     reject(options: UserRequestPromiseReject): UserRequestPromiseReject
//   }
// }

// export = jsmodbus;