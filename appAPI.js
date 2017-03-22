var express = require('express');
var app = express();

var VLC = require('./vlcAPI.js');
var player = new VLC();

var fileBrowser = require('./fileBrowser.js');
var fb = new fileBrowser();

app.get('/command/play', function (req, res) {
    console.log("received play command from " + req.ip + " with url parameter media =" + req.query.media);
    player.play(req.query.media, function () {
        console.log("play command sent");
    });
    res.send();
});

app.get('/command/pause', function (req, res) {
    console.log("received pause command from " + req.ip);
    player.pause(function() {
        console.log("pause command sent");
    });
    res.send();
});

app.get('/command/stop', function (req, res) {
    console.log("received stop command from " + req.ip);
    player.stop(function () {
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
