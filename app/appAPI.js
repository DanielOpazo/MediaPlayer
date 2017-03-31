var express = require('express');
var app = express();

//var VLC = require('./vlcAPI.js');
//var player = new VLC();

/* start the vlc subprocess */
const vlc = require('./vlcAPI.js');
var player = vlc.startVlc();


const fb = require('./fileBrowser.js');

var os = require("os");
var nif = os.networkInterfaces();

function getIPv4Address() {
    var ipv4address = "";
    Object.keys(nif).forEach(function (nifName) {
        var alias = 0;

        nif[nifName].forEach(function (niface) {
            if ('IPv4' !== niface.family || niface.internal !== false)
                return;

            if (alias >= 1) {
                console.log(nifName + ':' + alias, niface.address);
                console.log("ERROR unusual network configuration");
            }
            else
                ipv4address = (nifName, niface.address);
            alias++;
        });
    });
    return ipv4address;
}

app.get('/browse', function (req, res) {
    console.log("received browse command from " + req.ip + " with url parameter dir = " + req.query.dir);
    //should probably validate the path somehow, It should be validated at the fileBrowser.js level though
    fb.browse(req.query.dir, function (retVal) {
        console.log(retVal);
        res.json(retVal);
    });
});

app.get('/command/close', function (req, res) { //doesn't work atm. probably remove the command entirely
    console.log("received close command from " + req.ip);
    player.close();
    console.log("close command sent");
    res.send();
});

app.get('/command/discover', function (req, res) {
    console.log("received discover command from " + req.ip);
    var obj = {};
    res.json({name: os.hostname(), home: os.homedir(), address: getIPv4Address()});
});

app.get('/command/emptyPlaylist', function (req, res) {
    console.log("received emptyPlaylist command from " + req.ip);
    vlc.emptyPlaylist(function (vlcRes) {
        console.log("emptyPlaylist command sent");
    });
    res.send();
});

app.get('/command/fullscreen', function (req, res) {
    console.log("received fullscreen command from " + req.ip);
    vlc.fullscreen(function (vlcRes) {
        console.log("fullscreen command sent");
    });
    res.send();
});

app.get('/command/interfaces', function (req, res) {
    getIPv4Address();
    res.send();
});

app.get('/command/pause', function (req, res) {
    console.log("received pause command from " + req.ip);
    vlc.pause(function(vlcRes) {
        console.log("pause command sent");
    });
    res.send();
});

app.get('/command/play', function (req, res) {
    console.log("received play command from " + req.ip + " with url parameter media =" + req.query.media);
    vlc.play(req.query.media, function (vlcRes) {
        console.log("play command sent");
    });
    res.send();
});

app.get('/command/seek', function (req, res) {
    console.log("received seek command from " + req.ip + " with url parameter seconds =" + req.query.seconds);
    vlc.seek(req.query.seconds, function (vlcRes) {
        console.log("seek command sent");
    });
    res.send();
});

app.get('/command/status', function (req, res) {
    console.log("received status command from " + req.ip);
    vlc.status(function (status) {
        console.log("status command sent");
        res.send(status)
    });
});

app.get('/command/stop', function (req, res) {
    console.log("received stop command from " + req.ip);
    vlc.stop(function (vlcRes) {
        console.log("stop command sent");
    });
    res.send();
});

app.get('/command/volume', function (req, res) {//this needs validation to not set volume above 512
    console.log("received volume command from " + req.ip);
    vlc.volume(req.query.val, function (vlcRes) {
        console.log("volume command sent");
    });
    res.send();
});

function startServer(port) {
    var server = app.listen(8081, function() {
        var host = server.address().address;
        var port = server.address().port;
        console.log("Server listening at http://%s:%s", host, port);
    });
}

/* externally visible. Called by index.js of app folder */
module.exports.start = startServer;
