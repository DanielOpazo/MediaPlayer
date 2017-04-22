/* child_process will be used to start the VLC process */
var childProcess = require('child_process')

/* vlc http server parameters */
const options = require('./vlcConfig.json')

/* logger */
var winston = require('winston')
var logger = winston.loggers.get('vlcProcess')

/*
 * initialize vlc in a subprocess, and return the vlc instance object
 */
function startVlc () {
  /* puts the arguments to vlc process in proper format */
  var pargs = []

  if (options.communication !== undefined) {
    pargs.push('-I')
    pargs.push(options.communication)
  }

  if (options.port !== undefined) {
    pargs.push('--http-port')
    pargs.push(options.port)
  }

  if (options.password !== undefined) {
    pargs.push('--http-password')
    pargs.push(options.password)
  }

  /* start the vlc process */
  var player = childProcess.spawn(options.player, pargs)
  logger.info('vlc child process started')

  player.stderr.on('data', function (data) {
    logger.error(data.toString())
  })

  player.stdout.on('data', function (data) {
    logger.info(data.toString())
  })

  return player
}

module.exports.startVlc = startVlc
