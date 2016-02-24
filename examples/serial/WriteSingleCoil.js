var ModbusClient    = require('../..'),
    client          = ModbusClient.createSerialClient('/dev/tty0', 9600);

client.on('connect', function () { 
    
    client.writeSingleCoil(4, true).then(function (resp) {
    
        console.log(resp);
    
    }).fail(function (err) {
    
        console.log(err);
    
    }).done(function () {
    
        client.close();
    
    });

});

client.on('error', function (err) {

    console.log(err);

});
