(function() {
  var params = {};
  var r = /([^&=]+)=?([^&]*)/g;

  function d(s) {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  }

  var match, search = window.location.search;
  while (match = r.exec(search.substring(1)))
    params[d(match[1])] = d(match[2]);

  window.params = params;
})();

function setBandwidth(connection) {
  // www.RTCMultiConnection.org/docs/bandwidth/
  connection.bandwidth = {
    screen: 300 // 300kbps
  };

  connection.processSdp = function(sdp) {
    sdp = setSendBandwidth(sdp);
    return sdp;
  };

  function setSendBandwidth(sdp) {
    var sdpLines = sdp.split('\r\n');

    // VP8
    var vp8Index = findLine(sdpLines, 'a=rtpmap', 'VP8/90000');
    var vp8Payload;
    if (vp8Index) {
      vp8Payload = getCodecPayloadType(sdpLines[vp8Index]);
    }

    var rtxIndex = findLine(sdpLines, 'a=rtpmap', 'rtx/90000');
    var rtxPayload;
    if (rtxIndex) {
      rtxPayload = getCodecPayloadType(sdpLines[rtxIndex]);
    }

    var rtxFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + rtxPayload.toString());
    if (rtxFmtpLineIndex !== null) {
      var appendrtxNext = '\r\n';
      appendrtxNext += 'a=fmtp:' + vp8Payload + ' x-google-min-bitrate=300; x-google-max-bitrate=300';
      sdpLines[rtxFmtpLineIndex] = sdpLines[rtxFmtpLineIndex].concat(appendrtxNext);
      sdp = sdpLines.join('\r\n');
    }
    return sdp;
  }

  function findLine(sdpLines, prefix, substr) {
    return findLineInRange(sdpLines, 0, -1, prefix, substr);
  }

  function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
    var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
    for (var i = startLine; i < realEndLine; ++i) {
      if (sdpLines[i].indexOf(prefix) === 0) {
        if (!substr ||
          sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
          return i;
        }
      }
    }
    return null;
  }

  function getCodecPayloadType(sdpLine) {
    var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
    var result = sdpLine.match(pattern);
    return (result && result.length === 2) ? result[1] : null;
  }
}

// http://www.rtcmulticonnection.org/docs/constructor/
var connection = new RTCMultiConnection(params.s);

setBandwidth(connection);

connection.optionalArgument = {
  optional: [{
    DtlsSrtpKeyAgreement: true
  }, {
    googImprovedWifiBwe: true
  }, {
    googScreencastMinBitrate: 300
  }, {
    googIPv6: true
  }, {
    googDscp: true
  }, {
    googCpuUnderuseThreshold: 55
  }, {
    googCpuOveruseThreshold: 85
  }, {
    googSuspendBelowMinBitrate: true
  }, {
    googCpuOveruseDetection: true
  }],
  mandatory: {}
};

connection.ondisconnected = function(event) {
  infoBar.innerHTML = 'Screen sharing has been closed.';
  infoBar.style.display = 'block';
  location.reload();
};