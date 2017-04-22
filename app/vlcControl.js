/*
 * created by Daniel Opazo, 2016/12/12
 */

/* http is used to communicate with VLC's API */
var http = require('http')

/* vlc http server parameters */
const options = require('./vlcConfig.json')

/* logger */
var winston = require('winston')
var logger = winston.loggers.get('vlcControl')

/* functions that talk to VLC   */

/* toggle pause/play */
function pause (cb) {
  apiCall(options, 'pl_pause', {}, cb)
}

function stop (cb) {
  apiCall(options, 'pl_stop', {}, cb)
}

function play (media, cb) {
  if (cb !== undefined) {
    apiCall(options, 'in_play', { input: media }, cb)
  }
  setTimeout(function () { // TODO only do this if it's not already fullscreen
    apiCall(options, 'fullscreen', {}, undefined)
  }, 500)
}

function fullscreen (cb) {
  apiCall(options, 'fullscreen', {}, cb)
}

function emptyPlaylist (cb) { // basically stop
  apiCall(options, 'pl_empty', {}, cb)
}

function seek (seconds, cb) {
  apiCall(options, 'seek', { val: seconds }, cb)
}

function status (cb) {
  apiCall(options, '', {}, function (res) { // need to handle an error here if vlc isn't running
    var full = ''
    res.on('data', function (data) {
      full += data.toString()
    })

    res.on('end', function (e) {
      cb(JSON.parse(full))
    })
  })
}

function volume (vol, cb) {
  apiCall(options, 'volume', { val: vol }, cb)
}

/* externally visible functions */
module.exports.emptyPlaylist = emptyPlaylist
module.exports.fullscreen = fullscreen
module.exports.pause = pause
module.exports.play = play
module.exports.seek = seek
module.exports.status = status
module.exports.stop = stop
module.exports.volume = volume

/* Call the vlc api
 * @param {options} options "The options to configure the vlc http server"
 * @param {string} command "The command given to the vlc server"
 * @param {array} args "The arguments for the given command"
 * @param {Function} callback "The callback function which is passed the response from the vlc server"
*/

function apiCall (options, command, args, callback) {
  var urlArgs = ''

  /* put the arguments into the proper form for the http get */
  for (var key in args) {
    urlArgs = '&' + encodeURIComponent(key) + '=' + encodeURIComponent(args[key])
  }

  command = '?command=' + command

  logger.info(command + urlArgs)

  /* call the vlc api using http */
  http.get({
    hostname: 'localhost',
    port: options.port,
    path: '/requests/status.json' + command + urlArgs,
    auth: ':' + options.password,
    agent: false
  }, function (res) { // this needs to handle the error if vlc isn't running
    if (callback !== undefined) {
      callback(res)
    }
  })
}
