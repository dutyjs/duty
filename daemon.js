class Daemonize {
    constructor() {}
    
}
var Service = require('node-linux').Service;

// Create a new service object
var svc = new Service({
    name:'Test Test Test',
    description: 'Testing this module.',
    script: 'node ./test.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.

svc.on('install',function(){
    svc.start();
});

svc.install();
