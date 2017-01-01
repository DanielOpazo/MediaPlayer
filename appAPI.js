var express = require('express');
var app = express();

var VLC = require('./vlcAPI.js');
var player = new VLC();

app.get('/command/play', function (req, res) {
    console.log("received play command");
    player.play("/home/daniel/Videos/test.avi", function () {
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


var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server listening at http://%s:%s", host, port);
});
