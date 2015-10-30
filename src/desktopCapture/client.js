var onMessageCallbacks = {};
var pub = 'pub-c-829f4c73-38fa-4e3a-a6b1-f93d2e56a637';
var sub = 'sub-c-8e581490-60ff-11e5-b50b-0619f8945a4f';

WebSocket = PUBNUB.ws;
// wss://pubsub.pubnub.com/pub-c-829f4c73-38fa-4e3a-a6b1-f93d2e56a637/sub-c-8e581490-60ff-11e5-b50b-0619f8945a4f
var websocket = new WebSocket('wss://pubsub.pubnub.com/' + pub + '/' + sub + '/' + connection.channel);

websocket.onmessage = function(e) {
  data = JSON.parse(e.data);

  if (data.sender == connection.userid) return;

  if (onMessageCallbacks[data.channel]) {
    onMessageCallbacks[data.channel](data.message);
  };
};

websocket.push = websocket.send;
websocket.send = function(data) {
  data.sender = connection.userid;
  websocket.push(JSON.stringify(data));
};

// overriding "openSignalingChannel" method
connection.openSignalingChannel = function(config) {
  var channel = config.channel || this.channel;
  onMessageCallbacks[channel] = config.onmessage;

  if (config.onopen) setTimeout(config.onopen, 1000);

  // directly returning socket object using "return" statement
  return {
    send: function(message) {
      websocket.send({
        sender: connection.userid,
        channel: channel,
        message: message
      });
    },
    channel: channel
  };
};

websocket.onerror = function() {
  if(connection.numberOfConnectedUsers <= 0) {
    location.reaload();
  }
};

websocket.onclose = function() {
  if(connection.numberOfConnectedUsers <= 0) {
    location.reaload();
  }
};

infoBar.innerHTML = 'Connecting WebSockets server.';

websocket.onopen = function() {
  infoBar.innerHTML = 'WebSockets connection is opened.';

  var sessionDescription = {
    userid: params.s,
    extra: {},
    session: {
      video: true,
      oneway: true
    },
    sessionid: params.s
  };

  if (params.s) {
    infoBar.innerHTML = 'Joining session: ' + params.s;

    if(params.p) {
      // it seems a password protected room.
      connection.extra.password = params.p;
    }

    connection.join(sessionDescription);
  }
};