var modbus  = require('../..'),
    client  = modbus.client.serial.complete({ 'portName' : process.argv[2], 'baudRate' : process.argv[3] });

client.on('connect', function () {

    client.readHoldingRegisters(process.argv[4], process.argv[5]).then(function (resp) {
    
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

