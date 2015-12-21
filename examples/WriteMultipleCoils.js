
var modbus  = require('..'),
    util    = require('util');

// override logger function
modbus.setLogger(function (msg) { util.log(msg); } );

var client      = modbus.createTCPClient(502, '192.168.1.1'),
    cntr        = 0,
    closeClient = function () {
        cntr += 1;
        if (cntr === 5) {
            client.close();
        }
    };

client.on('close', function () {

    console.log('closed');

}.bind(this));

var closeClient = function () {

    client.close();

}.bind(this);

client.on('connect', function () { 
    
    console.log('connected');

    client.writeMultipleCoils(0, [1, 1, 1], function (resp, err) {

        if (err) {
            console.log(err);
            closeClient();
            return;
        }

        console.log(resp);
        closeClient();

    }.bind(this));

}.bind(this));


