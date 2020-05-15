A simple an easy to use Modbus TCP client/server implementation.

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Modbus [![Build Status](https://travis-ci.org/Cloud-Automation/node-modbus.png)](https://travis-ci.org/Cloud-Automation/node-modbus)
========

Modbus is a simple Modbus TCP/RTU Client/Server with a simple API. It supports modbus function codes 1 - 6 and 15 and 16.

Status
------

Version 4.0.0 is a early beta release. Please use and test it and help make it better. We keep you posted on the status of this module.

Installation
------------

Just type `npm install jsmodbus` and you are ready to go. You can also install this module globally and use the Command Line Interface. Simply type `npm install -g jsmodbus`.

CLI
---

Version 4 offers a Command Line Interface. Just install the module globally and type `jsmodbus --help` to get some more Information.

Testing
-------

The test files are implemented using [mocha](https://github.com/visionmedia/mocha) and sinon.

Simply `npm install -g mocha` and `npm install -g sinon`. To run the tests type from the projects root folder `mocha test/*`.

Please feel free to fork and add your own tests.

Debugging
---------
If you want to see some debugging information, since Version 3 we use the debug module. You can filter the debug output by defining the DEBUG environment variable like so `export DEBUG=*`

TCP Client Example
--------------
```javascript
// create a tcp modbus client
const Modbus = require('jsmodbus')
const net = require('net')
const socket = new net.Socket()
const client = new Modbus.client.TCP(socket, unitId)
const options = {
'host' : host
'port' : port
}

```

RTU Client Example
---------------------
```javascript

// create a tcp modbus client
const Modbus = require('jsmodbus')
const SerialPort = require('serialport')
const options = {
baudRate: 57600
}
const socket = new SerialPort("/dev/tty-usbserial1", options)
const client = new Modbus.client.RTU(socket, address)
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

});

socket.connect(options)

```

Keeping TCP Connections alive
----------------------------
I've written a module to keep net.Socket connections alive by emitting TCP Keep-Alive messages. Have a look at the node-net-reconnect module.

Server example
--------------
```javascript

const modbus = require('jsmodbus')
const net = require('net')
const netServer = new net.Server()
const server = new modbus.server.TCP(netServer)

netServer.listen(502)

````


## License (MIT)

Copyright (C) 2017 Stefan Poeter (Stefan.Poeter[at]cloud-automation.de)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
