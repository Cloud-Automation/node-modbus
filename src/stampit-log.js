var stampit = require('stampit');


var log = stampit()
    .refs({
    })
    .init(function () {
   
        var init = function () {
        
            if (!this.logEnabled) {
                this.log = function () { };
            }
        
        }.bind(this);

        this.log = function () {
        
            console.log.apply(null, arguments);
        
        };
   
        init(); 
    
    });

module.exports = log;
