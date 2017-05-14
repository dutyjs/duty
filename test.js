
var nodeNotify = require('node-notifier');
var date = new Date();


date = date.toLocaleDateString();

if ( date === "4/20/2017" ) {
    /*nodeNotify.notify({
        'title': 'My notification',
        'message': 'Hello, there!'
     });*/


    const path = require('path');

    nodeNotify.notify({
        title:' Awesomeeeeeeeee ',
        message: ' Hello from node, Mr. User!',
        icon: path.join(__dirname, 'assets/logo.png'),
        sound: true,
        wait: true,
    }, function(err,response) {
        if ( err ) return console.error(err);
        
    });

    nodeNotify.on('click', function(nObject, options) {
        console.log(nObject,options);
    });

    nodeNotify.on('timeout', function(nObject, options) {
        console.log(nObject,options);
    });
    
}
