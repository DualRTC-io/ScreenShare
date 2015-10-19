var express = require('express');
var app = express();
var fs = require('fs');
var config = require('./js/config');
var io;
var server;

if (config.ws.secured) { // HTTPS
    var https = require('https');
    var options = {
        key: fs.readFileSync('server.key', 'utf8'),
        cert: fs.readFileSync('server.crt', 'utf8')
    };
    var securePort = config.ws.securePort;
    server = https.createServer(options, app).listen(securePort, function (err) {
        console.log('[+] Set [https] protocol and server running at port #' + securePort);
    });
} else { // HTTP
    var http = require('http');
    var port = config.ws.port;
    server = http.createServer(app).listen(port, function (err) {
        console.log('[+] Set [http] protocol and server running at port #' + port);
    });
}

// Handle resource request by server
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/screen.html');
});

app.get('/screen.html', function(req, res) {
    res.sendFile(__dirname + '/screen.html');
});

app.get('/js/screen.js', function(req, res) {
    res.sendFile(__dirname + '/js/screen.js');
});


app.use(express.static('.'));
