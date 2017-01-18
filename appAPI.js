var express = require('express');
var app = express();

var VLC = require('./vlcAPI.js');
var player = new VLC();

var fileBrowser = require('./fileBrowser.js');
var fb = new fileBrowser();

app.get('/command/play', function (req, res) {
    console.log("received play command with url parameter media =" + req.query.media);
    player.play(req.query.media, function () {
        console.log("play command sent");
    });
    res.send();
});

app.get('/command/pause', function (req, res) {
    console.log("received pause command");
    res.send();
});

app.get('/command/stop', function (req, res) {
    console.log("received stop command");
    player.stop(function () {
        console.log("stop command sent");
    });
    res.send();
});

app.get('/browse', function (req, res) {
    console.log("received browse command with url parameter dir = " + req.query.dir);
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
