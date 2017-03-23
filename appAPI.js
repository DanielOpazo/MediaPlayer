var express = require('express');
var app = express();

var VLC = require('./vlcAPI.js');
var player = new VLC();

var fileBrowser = require('./fileBrowser.js');
var fb = new fileBrowser();

app.get('/command/play', function (req, res) {
    console.log("received play command from " + req.ip + " with url parameter media =" + req.query.media);
    player.play(req.query.media, function (vlcRes) {
        console.log("play command sent");
    });
    res.send();
});

app.get('/command/seek', function (req, res) {
    console.log("received seek command from " + req.ip + " with url parameter seconds =" + req.query.seconds);
    player.seek(req.query.seconds, function (vlcRes) {
        console.log("seek command sent");
    });
    res.send();
});

app.get('/command/pause', function (req, res) {
    console.log("received pause command from " + req.ip);
    player.pause(function(vlcRes) {
        console.log("pause command sent");
    });
    res.send();
});

app.get('/command/stop', function (req, res) {
    console.log("received stop command from " + req.ip);
    player.stop(function (vlcRes) {
        console.log("stop command sent");
    });
    res.send();
});

app.get('/command/close', function (req, res) {
    console.log("received close command from " + req.ip);
    player.close();
    console.log("close command sent");
    res.send();
});

app.get('/command/discover', function (req, res) {
    console.log("received discover command from " + req.ip);
    res.send("Daniel Media Player");
});

app.get('/command/fullscreen', function (req, res) {
    console.log("received fullscreen command from " + req.ip);
    player.fullscreen(function (vlcRes) {
        console.log("fullscreen command sent");
    });
    res.send();
});

app.get('/command/emptyPlaylist', function (req, res) {
    console.log("received emptyPlaylist command from " + req.ip);
    player.emptyPlaylist(function (vlcRes) {
        console.log("emptyPlaylist command sent");
    });
    res.send();
});

app.get('/command/status', function (req, res) {
    console.log("received status command from " + req.ip);
    player.status(function (status) {
        console.log(status);
        console.log("status command sent");
        res.send(status)
    });
});

app.get('/browse', function (req, res) {
    console.log("received browse command from " + req.ip + " with url parameter dir = " + req.query.dir);
    //should probably validate the path somehow, It should be validated at the fileBrowser.js level though
    fb.browse(req.query.dir, function (retVal) {
        console.log(retVal);
        res.json(retVal);
    });
});


var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server listening at http://%s:%s", host, port);
});
