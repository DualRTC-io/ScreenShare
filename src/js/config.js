// Web server
var ws = {};
module.exports.ws = ws;
ws.port = 80;
ws.securePort = 443;
ws.secured = false;

// Database
var db = {};
module.exports.db = db;
db.present = false;
db.host = 'localhost';
db.user = 'user';
db.password = 'password';
db.database = 'webrtcdb';
