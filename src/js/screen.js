// OpenTok API Key
var apiKey    = '45369152';
var sessionId = '1_MX40NTM2OTE1Mn5-MTQ0NDM5MDc5NDExOH5PRjNMK2ZjRktaS29mTTE1SWpnc1gzb3V-UH4';
var token     = 'T1==cGFydG5lcl9pZD00NTM2OTE1MiZzaWc9ZjU1YjI4YzNiNTMzOGExOWMyOTI4M2YxYjI0YmVjYmU4YjQyM2UyYjpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5UTTJPVEUxTW41LU1UUTBORE01TURjNU5ERXhPSDVQUmpOTUsyWmpSa3RhUzI5bVRURTFTV3BuYzFnemIzVi1VSDQmY3JlYXRlX3RpbWU9MTQ0NDM5MDgxOCZub25jZT0wLjUxODAwNDg2ODU3NTI3NiZleHBpcmVfdGltZT0xNDQ0NDc3MTY0JmNvbm5lY3Rpb25fZGF0YT0=';
var extensionId = 'bibaekpncanjnbnkpichhjhmgkemiflb';
var session = OT.initSession(apiKey, sessionId);

function initBody() {
    initShareScreen();
    //initFullScreen();
}

function initShareScreen() {
    var button = document.getElementById("shareScreen");
    button.addEventListener('click', function (event) {
        screenshare();
    });
}

session.connect(token, function(error) {
    //document.getElementById('shareScreen').disabled = false;
    //document.getElementById('fullScreen').disabled = false;
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
                { videoSource : 'screen',width:1280,height:720 },
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

