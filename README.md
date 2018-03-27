A simple an easy to use Modbus TCP client/server implementation.

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Modbus [![Build Status](https://travis-ci.org/Cloud-Automation/node-modbus.png)](https://travis-ci.org/Cloud-Automation/node-modbus)
========

Modbus is a simple Modbus TCP/RTU Client/Server with a simple API. It supports modbus function codes 1 - 6 and 15 and 16.

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
// create a tcp modbus client
let Modbus = require('jsmodbus')
let net = require('net')
let socket = new net.Socket()
let client = new Modbus.client.TCP(socket, unitId)
let options = {
  'host' : host
  'port' : port
}

```

RTU Client Example
---------------------
```javascript

// create a tcp modbus client
let Modbus = require('jsmodbus')
let SerialPort = require('serialport')
let options = {
  baudRate: 57600
}
let socket = new SerialPort("/dev/tty-usbserial1", options)
let client = new Modbus.client.RTU(socket, address)
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
    
  let modbus = require('jsmodbus')
  let net = require('net')
  let server = new net.Server()
  let server = new modbus.server.TCP(server)

  server.listen(502) 

````

## Long Running Test Results

We've got a munin server running some scripts. You can find detailed results on [jsmodbus.cloud-automation.de](jsmodbus.cloud-automation.de).

![CPU usage per day](http://jsmodbus.cloud-automation.de/localdomain/localhost.localdomain/cpu_by_node_process-day.png)

![Memory usage per day](http://jsmodbus.cloud-automation.de/localdomain/localhost.localdomain/memory_by_node_process-day.png)

## License

Copyright (C) 2017 Stefan Poeter (Stefan.Poeter[at]cloud-automation.de)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
