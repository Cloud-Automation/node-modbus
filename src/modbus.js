var fs = require('fs');

exports.client = {
    tcp     : {
        core        : require('./modbus-tcp-client.js'),
        complete    : require('./modbus-tcp-client.js')
    },
    serial  : {
        core        : require('./modbus-serial-client.js'),
        complete    : require('./modbus-serial-client.js')
    },
    handler : {
    
    }

};

fs.readdirSync(__dirname + '/handler/client')
    .filter(function (file) {

        return file.substr(-3) === '.js';

    }).forEach(function (file) {

        exports.client.tcp.complete = exports.client.tcp.complete.compose(require('./handler/client/' + file));
        exports.client.serial.complete = exports.client.serial.complete.compose(require('./handler/client/' + file));
        exports.client.handler[file.substr(0, file.length - 3)] = require('./handler/client/' + file);

    });

exports.server = { 
    tcp         : {
        core        : require('./modbus-tcp-server.js'),
        complete    : require('./modbus-tcp-server.js'),
    },
    handler     : { }
};

fs.readdirSync(__dirname + '/handler/server')
    .filter(function (file) {

        return file.substr(-3) === '.js';

    }).forEach(function (file) {

        exports.server.tcp.complete = exports.server.tcp.complete.compose(require('./handler/server/' + file));
        exports.server.handler[file.substr(0, file.length - 3)] = require('./handler/server/' + file);

    });

