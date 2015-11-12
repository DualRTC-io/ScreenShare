// DOM objects
var remoteVideo = document.getElementById('remoteVideo');
var card = document.getElementById('card');
var containerDiv;

if (navigator.mozGetUserMedia) {
  attachMediaStream = function(element, stream) {
    console.log("Attaching media stream");
    element.mozSrcObject = stream;
    element.play();
  };
  reattachMediaStream = function(to, from) {
    console.log("Reattaching media stream");
    to.mozSrcObject = from.mozSrcObject;
    to.play();
  };
} else if (navigator.webkitGetUserMedia) {
  attachMediaStream = function(element, stream) {
    if (typeof element.srcObject !== 'undefined') {
      element.srcObject = stream;
    } else if (typeof element.mozSrcObject !== 'undefined') {
      element.mozSrcObject = stream;
    } else if (typeof element.src !== 'undefined') {
      element.src = URL.createObjectURL(stream);
    } else {
      console.log('Error attaching stream to element.');
    }
  };
  reattachMediaStream = function(to, from) {
    to.src = from.src;
  };
} else {
  console.log("Browser does not appear to be WebRTC-capable");
}
// onstream event; fired both for local and remote videos

var infoBar = document.getElementById('info-bar');

connection.onstatechange = function(state) {
  infoBar.innerHTML = state.name + ': ' + state.reason;

  if(state.name == 'request-rejected' && params.p) {
    infoBar.innerHTML = 'Password (' + params.p + ') did not match with broadcaster, that is why your participation request has been rejected.<br>Please contact him and ask for valid password.';
  }

  if(state.name === 'room-not-available') {
    infoBar.innerHTML = 'Screen share session is closed or paused. You will join automatically when share session is resumed.';
  }
};

connection.onstreamid = function(event) {
  infoBar.innerHTML = 'Remote peer is about to send his screen.';
};

connection.onstream = function(e) {
  if (e.type == 'remote') {
    infoBar.style.display = 'none';
    remoteStream = e.stream;
    attachMediaStream(remoteVideo, e.stream);
    waitForRemoteVideo();
    remoteVideo.setAttribute('data-id', e.userid);

    websocket.send('received-your-screen');
  }
};
// if user left
connection.onleave = function(e) {
  transitionToWaiting();
};

connection.onSessionClosed = function() {
  infoBar.innerHTML = 'Screen sharing has been closed.';
  infoBar.style.display = 'block';
  location.reload();
};

connection.onstreamended = function() {};

function waitForRemoteVideo() {
  // Call the getVideoTracks method via adapter.js.
  var videoTracks = remoteStream.getVideoTracks();

  if (videoTracks.length === 0 || remoteVideo.currentTime > 0) {
    transitionToActive();
  }
  else {
    setTimeout(waitForRemoteVideo, 100);
  }
}

function transitionToActive() {
  remoteVideo.style.opacity = 1;
  card.style.webkitTransform = 'rotateY(180deg)';
  window.onresize();
}

function transitionToWaiting() {
  card.style.webkitTransform = 'rotateY(0deg)';
  remoteVideo.style.opacity = 0;
}
// Set the video displaying in the center of window.
window.onresize = function() {
  var aspectRatio;
  if (remoteVideo.style.opacity === '1') {
    aspectRatio = remoteVideo.videoWidth / remoteVideo.videoHeight;
  } else {
    return;
  }
  var innerHeight = this.innerHeight;
  var innerWidth = this.innerWidth;
  var videoWidth = innerWidth < aspectRatio * window.innerHeight ?
    innerWidth : aspectRatio * window.innerHeight;
  var videoHeight = innerHeight < window.innerWidth / aspectRatio ?
    innerHeight : window.innerWidth / aspectRatio;
  containerDiv = document.getElementById('container');
  containerDiv.style.width = videoWidth + 'px';
  containerDiv.style.height = videoHeight + 'px';
  containerDiv.style.left = (innerWidth - videoWidth) / 2 + 'px';
  containerDiv.style.top = (innerHeight - videoHeight) / 2 + 'px';
};

function enterFullScreen() {
  container.webkitRequestFullScreen();
}