/* globals __dirname, process, console */
var express = require('express');
var hogan = require('hogan-express');

var app = express();

app.configure(function(){
    app.set('view engine', 'html');
    app.set('views', __dirname + '/../templates');
    app.set('layout', 'layout');
    app.set('partials', {nav: 'nav'});
    // app.enable('view cache');
    app.engine('html', hogan);
    app.use(express.static(__dirname + '/../public'));
});

require('./routes')(app);

app.listen( process.env.PORT || 3000);

console.log('Application started at port: ' + process.env.PORT);
