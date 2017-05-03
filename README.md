A simple an easy to use Modbus TCP client/server implementation.

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Modbus [![Build Status](https://travis-ci.org/Cloud-Automation/node-modbus.png)](https://travis-ci.org/Cloud-Automation/node-modbus)
========

Modbus is a simple Modbus TCP/RTU Client with a simple API.

Installation
------------

Just type `npm install jsmodbus` and you are ready to go.

Testing
-------

The test files are implemented using [mocha](https://github.com/visionmedia/mocha) and sinon.

Simply `npm install -g mocha` and `npm install -g sinon`. To run the tests type from the projects root folder `mocha test/*`.

Please feel free to fork and add your own tests.

New in Version 3.0.0
--------------------

We got rid of all the dependencies like stampit and serialport and make extensive use of es6 features like promisses. This way we, the developer do not have any restrictions on how to use this module. Unfortunatly this way the module probably won't work for nodejs versions lower than 6.0. 

For modbus rtu we recommend the serialport npm module, for tcp the net.Socket interface is needed. When you need to keep a connection alive with some reconnect logic, use the node-net-reconnect module from our github page https://github.com/cloud-automation/node-net-reconnect.

Debugging
---------
If you want to see some debugging information, since Version 3 we use the debug module. You can filter the debug output by defining the DEBUG environment variable like so `export DEBUG=*`

TCP Client Example
--------------
```javascript
var modbus = require('jsmodbus');

// create a tcp modbus client
let Modbus = require('jsmodbus')
let net = require('net')
let socket = new new.Socket()
let client = new Modbus.client.TCP(socket, unitId)
let options = {
  'host' : host
  'port' : port
}

```

Serial Client Example
---------------------
```javascript

var modbus = require('jsmodbus');

// create a tcp modbus client
let Modbus = require('jsmodbus')
let SerialPort = require('serialport')
let options = {
  baudRate: 57600
}
let socket = new SerialPort("/dev/tty-usbserial1", options)
let client = new Modbus.client.Serial(socket)
```

Client API Example
------------------
```javascript
// for reconnecting see node-net-reconnect npm module

// use socket.on('open', ...) when using serialport
socket.on('connect', function () {

    // make some calls

    client.readCoils(0, 13).then(function (resp) {

        // resp will look like { response : [TCP|RTU]Response, request: [TCP|RTU]Request }
        // the data will be located in resp.response.body.coils: <Array>, resp.response.body.payload: <Buffer>

        console.log(resp);

    }, console.error);

    client.readDiscreteInputs(0, 13).then(function (resp) {

        // resp will look like { response : [TCP|RTU]Response, request: [TCP|RTU]Request }
        // the data will be located in resp.response.body.coils: <Array>, resp.response.body.payload : <Buffer>

        console.log(resp);

    }, console.error);

    client.readHoldingRegisters(0, 10).then(function (resp) {

        // resp will look like { response : [TCP|RTU]Response, request: [TCP|RTU]Request }
        // the data will be located in resp.response.body.registers: <Array>, resp.response.body.payload : <Buffer>

        console.log(resp); 

    }, console.error);

    client.readInputRegisters(0, 10).then(function (resp) {
        // resp will look like { response : [TCP|RTU]Response, request: [TCP|RTU]Request }
        // the data will be located in resp.response.body.registers: <Array>, resp.response.body.payload : <Buffer>

        console.log(resp);

    }, console.error);

    client.writeSingleCoil(5, true).then(function (resp) {

        // resp will look like { response : [TCP|RTU]Response, request: [TCP|RTU]Request }

        console.log(resp)

    }, console.error);

    client.writeSingleCoil(5, Buffer.from([0x01])).then(function (resp) {

      // resp will look like { fc: 5, byteCount: 4, outputAddress: 5, outputValue: true }
  
      console.log(resp);

    }, console.error);

    client.writeSingleRegister(13, 42).then(function (resp) {

      // resp will look like { fc: 6, byteCount: 4, registerAddress: 13, registerValue: 42 }
      console.log(resp);

    }, console.error);

    client.writeSingleRegister(13, Buffer.from([0x00 0x2A])).then(function (resp) {

      // resp will look like { fc: 6, byteCount: 4, registerAddress: 13, registerValue: 42 }
      console.log(resp);

    }, console.error);

    client.writeMultipleCoils(3, [1, 0, 1, 0, 1, 1]).then(function (resp) {

        // resp will look like { fc: 15, startAddress: 3, quantity: 6 }
        console.log(resp); 

    }, console.error);

    client.writeMultipleCoils(3, Buffer.from([0x2B]), 6).then(function (resp) {

        // resp will look like { fc: 15, startAddress: 3, quantity: 6 }
        console.log(resp); 

    }, console.error);

    client.writeMultipleRegisters(4, [1, 2, 3, 4]).then(function (resp) {
        
        // resp will look like { fc : 16, startAddress: 4, quantity: 4 }
        console.log(resp);
        
    }, console.error);

    client.writeMultipleRegisters(4, Buffer.from([0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x00, 0x04]).then(function (resp) {
        
        // resp will look like { fc : 16, startAddress: 4, quantity: 4 }
        console.log(resp);
        
    }, console.error);

});

socket.on('error', function (err) {

    console.log(err);
    
})

socket.connect(options)

```

TCP Client Reconnect Example
----------------------------

```javascript

    let socket = net require('net').Socket()
    let options = { 
      'host' : 'somehost', 
      'port' : someport,
      'retryTime' : 1000, // 1s for every retry
      'retryAlways' : true // retry even if the connection was closed on purpose
    }
    let Reconnect = require('node-net-reconnect')
    let recon = new Reconnect(socket, options)
    let client = new require('jsmodbus').tcp.Client(socket)

    socket.connect(options)

    socket.on('connect', function () {

      client.readCoils(...)
        .then(...)
        .catch(...)

      /* if you enabled retryAlways, a call to 
         socket.end() will reconnect the client.
         In that case you need to close the connection
         through the recon.end() method. */
      setTimeout(function () {
        recon.end()
      }, 10000)

    })
```

Server example
--------------
```javascript
    
    var stampit = require('stampit'),
        modbus = require('jsmodbus');

    var customServer = stampit()
        .refs({
            'logEnabled'        : true,
            'port'              : 8888,
            'responseDelay'     : 10, // so we do not fry anything when someone is polling this server
            'whiteListIPs'      : null, // filter connection only from these IPs (ex. ['127.0.0.1', '192.168.0.1'])

            // specify coils, holding and input register here as buffer or leave it for them to be new Buffer(1024)
            coils               : Buffer.alloc(1024, 0),
            holding             : Buffer.alloc(1024, 0),
            input               : Buffer.alloc(1024, 0)
        })
        .compose(modbus.server.tcp.complete)
        .init(function () {
        
            var init = function () {

                // get the coils with this.getCoils() [ Buffer(1024) ]
                // get the holding register with this.getHolding() [ Buffer(1024) ]
                // get the input register with this.getInput() [ Buffer(1024) ]                
              
                // listen to requests 

                this.on('readCoilsRequest', function (start, quantity) {
                
                    // do something, this will be executed in sync before the 
                    // read coils request is executed 
                    
                });

                // the write request have pre and post listener
                this.on('[pre][post]WriteSingleCoilRequest', function (address, value) {
                    
                    
                });

            }.bind(this);    
            
            
            init();
            
        });

    customServer();

    // you can of course always use a standard server like so

    var server = modbus.server.tcp.complete({ port : 8888 });

    // and interact with the register via the getCoils(), getHolding() and getInput() calls

    server.getHolding().writeUInt16BE(123, 1);

    // you can filter only certain IP addresses to connect

    var server = modbus.server.tcp.complete({ port : 8888, whiteListIPs: ['127.0.0.1', '192.168.0.1'] });
````

## License

Copyright (C) 2017 Stefan Poeter (Stefan.Poeter[at]cloud-automation.de)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
