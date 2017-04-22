var express = require('express')
var router = express.Router()

const vlc = require('./vlcControl.js')
// var player = vlc.player; //question is is this the same one

/* logger */
var winston = require('winston')
var logger = winston.loggers.get('command')

var os = require('os')
var nif = os.networkInterfaces()

router.get('/discover', function (req, res) {
  logger.info('received discover command from ' + req.ip)
  res.json({name: os.hostname(), home: os.homedir(), address: getIPv4Address()})
})

router.get('/emptyPlaylist', function (req, res) {
  logger.info('received emptyPlaylist command from ' + req.ip)
  vlc.emptyPlaylist(function (vlcRes) {
    logger.info('emptyPlaylist command sent')
  })
  res.send()
})

router.get('/fullscreen', function (req, res) {
  logger.info('received fullscreen command from ' + req.ip)
  vlc.fullscreen(function (vlcRes) {
    logger.info('fullscreen command sent')
  })
  res.send()
})

router.get('/interfaces', function (req, res) {
  getIPv4Address()
  res.send()
})

router.get('/pause', function (req, res) {
  logger.info('received pause command from ' + req.ip)
  vlc.pause(function (vlcRes) {
    logger.info('pause command sent')
  })
  res.send()
})

router.get('/play', function (req, res) {
  logger.info('received play command from ' + req.ip + ' with url parameter media =' + req.query.media)
  vlc.play(req.query.media, function (vlcRes) {
    logger.info('play command sent')
  })
  res.send()
})

router.get('/seek', function (req, res) {
  logger.info('received seek command from ' + req.ip + ' with url parameter seconds =' + req.query.seconds)
  vlc.seek(req.query.seconds, function (vlcRes) {
    logger.info('seek command sent')
  })
  res.send()
})

router.get('/status', function (req, res) {
  logger.info('received status command from ' + req.ip)
  vlc.status(function (status) {
    logger.info('status command sent')
    res.send(status)
  })
})

router.get('/stop', function (req, res) {
  logger.info('received stop command from ' + req.ip)
  vlc.stop(function (vlcRes) {
    logger.info('stop command sent')
  })
  res.send()
})

router.get('/volume', function (req, res) { // this needs validation to not set volume above 512
  logger.info('received volume command from ' + req.ip)
  vlc.volume(req.query.val, function (vlcRes) {
    logger.info('volume command sent')
  })
  res.send()
})

/* this doesn't work if the ip address switches while the server is running */
function getIPv4Address () {
  var ipv4address = ''
  Object.keys(nif).forEach(function (nifName) {
    var alias = 0
    nif[nifName].forEach(function (niface) {
      if (niface.family !== 'IPv4' || niface.internal !== false) { return }

      if (alias >= 1) {
        logger.info(nifName + ':' + alias, niface.address)
        logger.info('ERROR unusual network configuration')
      } else { ipv4address = (nifName, niface.address) }
      alias++
    })
  })
  return ipv4address
}

module.exports = router
