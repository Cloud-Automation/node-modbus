A simple an easy to use Modbus TCP client/server implementation.

Modbus
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

Client example
--------------
```javascript
var modbus = require('jsmodbus');

// create a modbus client
var client = modbus.createTCPClient(8888, '127.0.0.1', function (err) {
	if (err) {
		console.log(err);
		process.exit(0);
	}
});

// make some calls

client.readCoils(0, 13, function (resp, err) {
    // resp will look like { fc: 1, byteCount: 20, coils: [ values 0 - 13 ] } 
    console.log(err, resp);
});

client.readDiscreteInput(0, 13, function (resp, err) {
    // resp will look like { fc: 2, byteCount: 20, coils: [ values 0 - 13 ] } 
    console.log(err, resp);
});

client.readInputRegister(0, 10, function (resp, err) {
	// resp will look like { fc: 4, byteCount: 20, register: [ values 0 - 10 ] }
	console.log(err, resp);
});

client.readCoils(5, 3, function (resp, err) {
	// resp will look like { fc: 1, byteCount: 1, register: [ true, false, true ] }
	console.log(err, resp);
});

client.writeSingleCoil(5, true, function (resp, err) {
	// resp will look like { fc: 5, byteCount: 4, outputAddress: 5, outputValue: true }
	console.log(err, resp);
});

client.writeSingleRegister(13, 42, function (resp, err) {
	// resp will look like { fc: 6, byteCount: 4, registerAddress: 13, registerValue: 42 }
	console.log(err, resp);
});
```

Server example
--------------
```javascript
var modbus = require('jsmodbus');

// create readInputRegister handler
var rirHandler = function (start, quantity) {
  var resp = [];
  for (var i = start; i < start + quantity; i += 1) {
    resp.push(i);
  }

  return [resp];
};

var coil = false;
var writeCoilHandler = function (addr, value) {

   if (addr === 0) {
    coil = value;
  }

  return [addr, value];

};

// create Modbus TCP Server
modbus.createTCPServer(8888, '127.0.0.1', function (err, modbusServer) {
  // addHandler
  modbusServer.addHandler(4, rirHandler);
  modbusServer.addHandler(5, writeCoilHandler);
});
```

Development
-----------

To add other function codes on the client side see the test/serialClient.test.js and add a new test. To implement the test create an api call in src/serialClient.js and implement the pdu handler for the client in src/handler.js. That is mainly all.

On the server side all you need to do is to implement the handler for the request and the response in the `exports.Server.RequestHandler` and `exports.Server.ResponseHandler`. Don't forget to test!

That's it for now. Feel free to fork and implement more.

License
-------

Copyright (C) 2014 Stefan Poeter (Stefan.Poeter[at]cloud-automation.de)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
