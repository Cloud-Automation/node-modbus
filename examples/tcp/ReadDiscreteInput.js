
var ModbusClient    = require('../../'),
    client          = ModbusClient.createTcpClient('192.168.1.2', 502);

client.on('connect', function () {

    client.readDiscreteInputs(0, 12).then(function (resp) {
    
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
