
var jsModbus = require('..'),
    util = require('util');

// override logger function
jsModbus.setLogger(function (msg) { util.log(msg); } );

var client = jsModbus.createTCPClient(8000, '127.0.0.1');

var cntr = 0;
var closeClient = function () {
  cntr += 1;
  if (cntr === 5) {
    client.close();
  }
};


client.readInputRegister (0, 8, 
	function (resp) { 
  	  console.log('inside the first user cb');
	  console.log(resp);
          closeClient(); 
	});

client.readInputRegister (6, 10, 
	function (resp) { 
	  console.log('inside the second user cb');
	  console.log(resp);
          closeClient(); 
	});

client.readCoils (0, 2,
	function (resp, err) { 

        console.log(arguments);
	  if (err) {
	    console.log(err);
            closeClient();
	    return;
	  }
  
	  console.log('inside the third user cb');
	  console.log(resp);
	  closeClient();
	});

client.writeSingleCoil(0, false, closeClient);
client.writeSingleCoil(1, true, closeClient);

