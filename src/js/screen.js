
// Relayed
var apiKey    = '45383722';
var sessionId = '1_MX40NTM4MzcyMn5-MTQ0NTk1ODkwMzc0NH5LT3RpMUZlcWMwOTZtaGpMOE9sZ0JMLzl-UH4';
var token     = 'T1==cGFydG5lcl9pZD00NTM4MzcyMiZzaWc9ZWM3NDU5NDYxNDQwZTVjYjYxMzcxMDcxYzg1OWVkYjM4NzVhN2YzYTpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5UTTRNemN5TW41LU1UUTBOVGsxT0Rrd016YzBOSDVMVDNScE1VWmxjV013T1RadGFHcE1PRTlzWjBKTUx6bC1VSDQmY3JlYXRlX3RpbWU9MTQ0NTk1ODkwNyZub25jZT0wLjEzOTY1MzgyOTQ2NTA1MjM0JmV4cGlyZV90aW1lPTE0NDg1NTA4ODgmY29ubmVjdGlvbl9kYXRhPQ==';
var extensionId = 'kdgjponegkkhkigjlknapimncipajbpi';
var session = OT.initSession(apiKey, sessionId);

// Routed
/*
var apiKey    = '45383732';
var sessionId = '1_MX40NTM4MzczMn5-MTQ0NTk2Mjc1NzgzNn52am1xdWR1UUR0RVBoZWswZ0FWMGUwenZ-fg';
var token     = 'T1==cGFydG5lcl9pZD00NTM4MzczMiZzaWc9OGY4YTUwZDNkZWQ0MjVhMzRjOGFlZjg2YjQzZTJkMmJiZGMzMDMwZjpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5UTTRNemN6TW41LU1UUTBOVGsyTWpjMU56Z3pObjUyYW0xeGRXUjFVVVIwUlZCb1pXc3daMEZXTUdVd2VuWi1mZyZjcmVhdGVfdGltZT0xNDQ1OTYyODI3Jm5vbmNlPTAuMzYwOTUyMzEyNTUwOTMzNjMmZXhwaXJlX3RpbWU9MTQ0ODU1NDc1MSZjb25uZWN0aW9uX2RhdGE9';
*/

function initBody() {
    initShareScreen();
}

function initShareScreen() {
    var button = document.getElementById("shareScreen");
    button.addEventListener('click', function (event) {
        screenshare();
    });
}

/*
function initFullScreen() {
    var button = document.getElementById("fullScreen");
    button.addEventListener('click', function(event) {
        var elem = document.getElementById("shareScreen");

        //show full screen
        elem.webkitRequestFullScreen();
    });
}
 */

session.connect(token, function(error) {
    //document.getElementById('shareScreen').disabled = false;
});

session.on('streamCreated', function(event) {
    if (event.stream.videoType === 'screen') {
        // This is a screen-sharing stream published by another client
        var subOptions = {
            width: event.stream.videoDimensions.width / 2,
            height: event.stream.videoDimensions.height /2
        };
        session.subscribe(event.stream, 'screen-subscriber', subOptions);
    }
});

// For Google Chrome only, register your extension by ID,
// You can find it at chrome://extensions once the extension is installed
OT.registerScreenSharingExtension('chrome', extensionId);

function screenshare() {

    OT.checkScreenSharingCapability(function(response) {
        if (!response.supported || response.extensionRegistered === false) {
            alert('This browser does not support screen sharing.');
        } else if (response.extensionInstalled === false) {
            alert('Please install the screen sharing extension and load this page over HTTPS.');
        } else {
            // Screen sharing is available. Publish the screen.
            // Create an element, but do not display it in the HTML DOM:
            // var screenContainerElement = document.createElement('div');
            var screenContainerElement = document.getElementById("shareScreen");
            var screenSharingPublisher = OT.initPublisher(screenContainerElement,
                { videoSource : 'screen', width:1280, height:720 },
                function(error) {
                    if (error) {
                        alert('Something went wrong: ' + error.message);
                    } else {
                        session.publish(screenSharingPublisher, function(error) {
                            if (error) {
                                alert('Something went wrong: ' + error.message);
                            }
                        });
                    }
                });
        }
    });
}




