var ModbusClient  = require('../..'),
    client = ModbusClient('/dev/tty0', 9600);

client.on('connect', function () { 
    
    client.writeMultipleCoils(0, [1, 1, 1]).then(function (resp) {

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



