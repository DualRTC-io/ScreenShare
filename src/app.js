var express = require('express');
var app = express();
var fs = require('fs');
var config = require('./js/config');
var server;

if (config.ws.secured) { // HTTPS
    var https = require('https');
    var options = {
        key: fs.readFileSync('./key/key.pem', 'utf8'),
        cert: fs.readFileSync('./key/cert.pem', 'utf8')
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

app.get('/js/opentok.min.js', function(req, res) {
    res.sendFile(__dirname + '/js/opentok.min.js');
});

app.get('/js/jquery-2.1.4.min.js', function(req, res) {
    res.sendFile(__dirname + '/js/jquery-2.1.4.min.js');
});

app.use(express.static('.'));
