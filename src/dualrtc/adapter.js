// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection

// RTCPeerConnection-v1.5.js

var iceServers = [];

iceServers.push({
    url: 'stun:stun.l.google.com:19302'
});

iceServers.push({
    url: 'stun:stun.anyfirewall.com:3478'
});

iceServers.push({
    url: 'turn:turn.bistri.com:80',
    credential: 'homeo',
    username: 'homeo'
});

iceServers.push({
    url: 'turn:turn.anyfirewall.com:443?transport=tcp',
    credential: 'webrtc',
    username: 'webrtc'
});

iceServers = {
    iceServers: iceServers
};

/*
 var iceFrame, loadedIceFrame;
 function loadIceFrame(callback, skip) {
 if (loadedIceFrame) return;
 if (!skip) return loadIceFrame(callback, true);
 loadedIceFrame = true;
 var iframe = document.createElement('iframe');
 iframe.onload = function() {
 iframe.isLoaded = true;
 window.addEventListener('message', function(event) {
 if (!event.data || !event.data.iceServers) return;
 callback(event.data.iceServers);
 });
 iframe.contentWindow.postMessage('get-ice-servers', '*');
 };
 iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/';
 iframe.style.display = 'none';
 (document.body || document.documentElement).appendChild(iframe);
 };
 loadIceFrame(function(_iceServers) {
 iceServers.iceServers = iceServers.iceServers.concat(_iceServers);
 console.log('ice-servers', JSON.stringify(iceServers.iceServers, null, '\t'));
 });
 */

window.moz = !!navigator.mozGetUserMedia;

function RTCPeerConnection(options) {
    var w = window,
        PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
        SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
        IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

    var optional = {
        optional: []
    };

    if (!moz) {
        optional.optional = [{
            DtlsSrtpKeyAgreement: true
        }];
    }

    var peer = new PeerConnection(iceServers, optional);

    peer.onicecandidate = function(event) {
        if (event.candidate)
            options.onICE(event.candidate);
    };

    // attachStream = MediaStream;
    if (options.attachStream) peer.addStream(options.attachStream);

    // attachStreams[0] = audio-stream;
    // attachStreams[1] = video-stream;
    // attachStreams[2] = screen-capturing-stream;
    if (options.attachStreams && options.attachStream.length) {
        var streams = options.attachStreams;
        for (var i = 0; i < streams.length; i++) {
            peer.addStream(streams[i]);
        }
    }

    peer.onaddstream = function(event) {
        var remoteMediaStream = event.stream;

        // onRemoteStreamEnded(MediaStream)
        remoteMediaStream.onended = function() {
            if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
        };

        // onRemoteStream(MediaStream)
        if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

        console.debug('on:add:stream', remoteMediaStream);
    };

    var constraints = options.constraints || {
            optional: [],
            mandatory: {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: true
            }
        };

    // onOfferSDP(RTCSessionDescription)

    function createOffer() {
        if (!options.onOfferSDP) return;

        peer.createOffer(function(sessionDescription) {
            sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
            peer.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);
        }, onSdpError, constraints);
    }

    // onAnswerSDP(RTCSessionDescription)

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        //options.offerSDP.sdp = addStereo(options.offerSDP.sdp);
        peer.setRemoteDescription(new SessionDescription(options.offerSDP), onSdpSuccess, onSdpError);
        peer.createAnswer(function(sessionDescription) {
            sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
            peer.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);
        }, onSdpError, constraints);
    }

    function setBandwidth(sdp) {
        if (moz) return sdp;
        if (navigator.userAgent.toLowerCase().indexOf('android') > -1) return sdp;

        // removing existing bandwidth lines
        sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');

        // "300kbit/s" for screen sharing
        sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:300\r\n');

        return sdp;
    }

    peer.oniceconnectionstatechange = function() {
        options.oniceconnectionstatechange(peer);
    };

    createOffer();
    createAnswer();

    function onSdpSuccess() {}

    function onSdpError(e) {
        console.error('sdp error:', JSON.stringify(e, null, '\t'));
    }

    return {
        addAnswerSDP: function(sdp) {
            console.log('setting remote description', sdp.sdp);
            peer.setRemoteDescription(new SessionDescription(sdp), onSdpSuccess, onSdpError);
        },
        addICE: function(candidate) {
            console.log('adding candidate', candidate.candidate);

            peer.addIceCandidate(new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        },

        peer: peer
    };
}

// getUserMedia
var video_constraints = {
    mandatory: {},
    optional: []
};

function getUserMedia(options) {
    var n = navigator,
        media;
    n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
    n.getMedia(options.constraints || {
            audio: true,
            video: video_constraints
        }, streaming, options.onerror || function (e) {
            console.error(e);
        });

    function streaming(stream) {
        var video = options.video;
        if (video) {
            video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
            video.play();
        }
        options.onsuccess && options.onsuccess(stream);
        media = stream;
    }

    return media;
}