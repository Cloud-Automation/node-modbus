A simple an easy to use Modbus TCP client/server implementation.

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Modbus [![Build Status](https://travis-ci.org/Cloud-Automation/node-modbus.png)](https://travis-ci.org/Cloud-Automation/node-modbus)
========

Modbus is a simple Modbus TCP Client with a simple API.

Installation
------------

Just type `npm install jsmodbus` and you are ready to go.

Testing
-------

The test files are implemented using [mocha](https://github.com/visionmedia/mocha) and sinon.

Simply `npm install -g mocha` and `npm install -g sinon`. To run the tests type from the projects root folder `mocha test/*`.

Please feel free to fork and add your own tests.

TCP Client example
--------------
```javascript
var modbus = require('jsmodbus');

// create a modbus client
var client = modbus.client.tcp.complete({ 
        'host'              : host, 
        'port'              : port,
        'autoReconnect'     : true,
        'reconnectTimeout'  : 1000,
        'timeout'           : 5000,
        'unitId'            : 0
    });

client.connect();

// reconnect with client.reconnect()

client.on('connect', function () {

    // make some calls

    client.readCoils(0, 13).then(function (resp) {

        // resp will look like { fc: 1, byteCount: 20, coils: [ values 0 - 13 ], payload: <Buffer> } 
        console.log(resp);

    }, console.error);

    client.readDiscreteInputs(0, 13).then(function (resp) {

        // resp will look like { fc: 2, byteCount: 20, coils: [ values 0 - 13 ], payload: <Buffer> } 
        console.log(resp);

    }, console.error);

    client.readHoldingRegisters(0, 10).then(function (resp) {

        // resp will look like { fc: 3, byteCount: 20, register: [ values 0 - 10 ], payload: <Buffer> }
        console.log(resp); 

    }, console.error);

    client.readInputRegisters(0, 10).then(function (resp) {

	    // resp will look like { fc: 4, byteCount: 20, register: [ values 0 - 10 ], payload: <Buffer> }
	    console.log(resp);

    }, console.error);

    client.writeSingleCoil(5, true).then(function (resp) {

	    // resp will look like { fc: 5, byteCount: 4, outputAddress: 5, outputValue: true }
	    console.log(resp);

    }, console.error);

    client.writeSingleCoil(5, Buffer.from([0x01])).then(function (resp) {

	    // resp will look like { fc: 5, byteCount: 4, outputAddress: 5, outputValue: true }
	    console.log(resp);

    }, console.error);

    client.writeSingleRegister(13, 42).then(function (resp) {

	    // resp will look like { fc: 6, byteCount: 4, registerAddress: 13, registerValue: 42 }
	    console.log(resp);

    }, console.error);

    client.writeSingleRegister(13, Buffer.from([0x00, 0x2A])).then(function (resp) {

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

client.on('error', function (err) {

    console.log(err);
    
})

// when using arrays as parameters, jsmodbus assumes that all elements inside
// the array are 16bit values. If you want to send a bigger value (32 bit), you need
// to send a buffer, instead of an array:

var buf = Buffer.allocUnsafe(4); // 4 bytes == 32bit
buf.writeInt32BE(77777);

// now you can call any function normally, just sending a buffer instead of an
// array
client.writeMultipleRegisters(4, buf).then(function (resp) {
    // resp will look like { fc : 16, startAddress: 4, quantity: 4 }
    console.log(resp);
}, console.error);

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

Copyright (C) 2016 Stefan Poeter (Stefan.Poeter[at]cloud-automation.de)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
