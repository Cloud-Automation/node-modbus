
var modbus  = require('../'),
    util    = require('util');

modbus.setLogger(function (msg) { util.log(msg); });

var readCoils = function (start, quant) {

    var resp = [];
    for (var i = 0; i < quant; i += 1) {
        resp.push(true);
    }

    return [resp];

};

var readInputRegHandler = function (start, quant) {

    var resp = [];
    for (var i = start; i < start+quant; i += 1) {
        resp.push(i);
    }

    return [resp];

};

var writeSingleCoil = function (adr, value) {

    console.log('write single coil (' + adr + ', ' + value + ')');

    return [];

};

var writeSingleRegister = function (adr, value) {

    console.log('write single register (' + adr + ', ' + value + ')');

    return [];  

};


modbus.createTCPServer(512, '127.0.0.1', function (err, server) {

    if (err) {
        console.log(err);
        return;
    }

    server.addHandler(1, readCoils);
    server.addHandler(4, readInputRegHandler);
    server.addHandler(5, writeSingleCoil);
    server.addHandler(6, writeSingleRegister);

});


