
var modbus  = require('..'),
    util    = require('util');

// override logger function
modbus.setLogger(function (msg) { util.log(msg); } );

var client      = modbus.createTCPClient(502, '192.168.1.1');

client.on('connect', function () { 
    
    client.readHoldingRegister(0, 10, function (resp, err) {

        if (err) {
            console.log(err);
            client.close();
            return;
        }

        console.log(resp);
        client.close();

    }.bind(this));

}.bind(this));


