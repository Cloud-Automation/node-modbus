
var modbus  = require('..'),
    util    = require('util');

// override logger function
modbus.setLogger(function (msg) { util.log(msg); } );

var client      = modbus.createTCPClient(512, '127.0.0.1'),
    cntr        = 0,
    closeClient = function () {
        cntr += 1;
        if (cntr === 5) {
            client.close();
        }
    };


client.readInputRegister (0, 8).then(function (resp) { 
    console.log('inside the first user cb');
    console.log(resp);
    closeClient(); 
});

client.readInputRegister (6, 10).then(function (resp) { 
    console.log('inside the second user cb');
    console.log(resp);
    closeClient(); 
});

client.readCoils (0, 2).then(function (resp) { 

}).fail(function (err) {

    console.log(err);
    closeClient();

});

client.writeSingleCoil(0, false).then(closeClient);
client.writeSingleCoil(1, true).then(closeClient);

