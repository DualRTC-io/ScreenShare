var express = require('express');
var app = express();
var fs = require('fs');
var config = require('./js/config');
var io = require('socket.io');
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

io.listen(server);

var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
    var addedUser = false;

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        // we store the username in the socket session for this client
        socket.username = username;
        // add the client's username to the global list
        usernames[username] = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        // remove the username from global usernames list
        if (addedUser) {
            delete usernames[socket.username];
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});


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
