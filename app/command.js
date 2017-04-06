var express = require('express');
var router = express.Router();

const vlc = require('./vlcAPI.js');
//var player = vlc.player; //question is is this the same one

var os = require("os");
var nif = os.networkInterfaces();

router.get('/discover', function (req, res) {
    console.log("received discover command from " + req.ip);
    var obj = {};
    res.json({name: os.hostname(), home: os.homedir(), address: getIPv4Address()});
});

router.get('/emptyPlaylist', function (req, res) {
    console.log("received emptyPlaylist command from " + req.ip);
    vlc.emptyPlaylist(function (vlcRes) {
        console.log("emptyPlaylist command sent");
    });
    res.send();
});

router.get('/fullscreen', function (req, res) {
    console.log("received fullscreen command from " + req.ip);
    vlc.fullscreen(function (vlcRes) {
        console.log("fullscreen command sent");
    });
    res.send();
});

router.get('/interfaces', function (req, res) {
    getIPv4Address();
    res.send();
});

router.get('/pause', function (req, res) {
    console.log("received pause command from " + req.ip);
    vlc.pause(function(vlcRes) {
        console.log("pause command sent");
    });
    res.send();
});

router.get('/play', function (req, res) {
    console.log("received play command from " + req.ip + " with url parameter media =" + req.query.media);
    vlc.play(req.query.media, function (vlcRes) {
        console.log("play command sent");
    });
    res.send();
});

router.get('/seek', function (req, res) {
    console.log("received seek command from " + req.ip + " with url parameter seconds =" + req.query.seconds);
    vlc.seek(req.query.seconds, function (vlcRes) {
        console.log("seek command sent");
    });
    res.send();
});

router.get('/status', function (req, res) {
    console.log("received status command from " + req.ip);
    vlc.status(function (status) {
        console.log("status command sent");
        res.send(status)
    });
});

router.get('/stop', function (req, res) {
    console.log("received stop command from " + req.ip);
    vlc.stop(function (vlcRes) {
        console.log("stop command sent");
    });
    res.send();
});

router.get('/volume', function (req, res) {//this needs validation to not set volume above 512
    console.log("received volume command from " + req.ip);
    vlc.volume(req.query.val, function (vlcRes) {
        console.log("volume command sent");
    });
    res.send();
});

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

module.exports = router;


