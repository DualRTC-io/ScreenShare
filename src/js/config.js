// Web server
var ws = {};
module.exports.ws = ws;
ws.port = 3000;
ws.securePort = 8080;
ws.secured = true;

// Database
var db = {};
module.exports.db = db;
db.present = false;
db.host = 'localhost';
db.user = 'user';
db.password = 'password';
db.database = 'webrtcdb';
