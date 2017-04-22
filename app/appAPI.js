var express = require('express')
var app = express()

/* logger */
var winston = require('winston')
var logger = winston.loggers.get('appAPI')

/* start the vlc subprocess */
const vlcProcess = require('./vlcProcess.js')
var player = vlcProcess.startVlc()

/* routers */
const command = require('./command.js')
const browse = require('./browse.js')

app.use('/command', command)
app.use('/browse', browse)

// for testing
app.get('/error', function (req, res) {
  process.nextTick(function () {
    throw new Error('whoops')
  })
})

/* Error Handlers */

/* default handler. handles exceptions from nodejs call stack, not asynchronous APIs */
app.use(function errorHandler (err, request, response, next) {
  logger.error(err)
  response.status(500).send('Something broke!')
})

/* This seems fairly robust. It kills vlc, and exits normally, eg. closing the server */
process.on('SIGINT', function () {
  logger.info('Received SIGINT. Killing VLC process.')
  cleanup()
})

process.on('exit', function (code) {
  logger.info('About to exit with code:' + code)
})

/* close resources on hard crash */
process.on('uncaughtException', function (err) {
  logger.error('Uncaught exception', err)
  cleanup()
})

/* When manually closing the process, close resources */
function cleanup () {
  player.kill('SIGINT')
  process.exit()
}

function startServer (port) {
  var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
    logger.info('Server listening at http://%s:%s', host, port)
  })
}

/* externally visible. Called by index.js of app folder */
module.exports.start = startServer
