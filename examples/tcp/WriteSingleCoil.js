var ModbusClient    = require('../..'),
    client          = ModbusClient.createTcpClient('192.168.1.2', 502);

// override logger function
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


