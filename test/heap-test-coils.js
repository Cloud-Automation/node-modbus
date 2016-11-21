const modbus = require('../');
const v8 = require('v8');

const client = modbus.client.tcp.complete({
    'host' : 'localhost',
    'port' : 8888
});

client.connect();

client.on('connect', function () {

    for (let i = 1; i < 1e5; i++) {
        client.readCoils(0,13);
    }

    console.log('Heap:', Math.floor(v8.getHeapStatistics().used_heap_size / 1e6), 'MB');

});
