var express = require('express');
var app = express();

/* start the vlc subprocess */
const vlcProcess = require('./vlcProcess.js');
var player = vlcProcess.startVlc();

/* routers */
const command = require('./command.js');
const browse = require('./browse.js');

/* This seems fairly robust. It kills vlc, and exits normally, eg. closing the server */
process.on('SIGINT', function ()  {
    console.log('Received SIGINT. Killing VLC process.');
    cleanup();
});

process.on('exit', function (code) {
  console.log("About to exit with code:" + code);
});

/* close resources on hard crash */
process.on('uncaughtException', function (err) {
    console.error('Uncaught exception', err);
    cleanup();
});

/* When manually closing the process, close resources */
function cleanup() {
    player.kill('SIGINT');
    process.exit();
}


/* Routers */

app.use('/command', command);

app.use('/browse', browse);

app.get('/error', function (req, res) {
    process.nextTick(function() {
      throw new Error('whoops');
   });
});

/* Error Handlers */

/* default handler. handles exceptions from nodejs call stack, not asynchronous APIs */
app.use(function errorHandler (err, request, response, next) {
    console.error(err);
    response.status(500).send('Something broke!');
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
