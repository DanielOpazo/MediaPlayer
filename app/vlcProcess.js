/* child_process will be used to start the VLC process */
var child_process = require('child_process');

/* vlc http server parameters */
const options = require('./vlcConfig.json');

/* logger */
var winston = require('winston');
var logger = winston.loggers.get('vlcProcess');

logger.info('logging info from vlcProcess.js');
logger.error('logging error from vlcProcess.js');

/*
 * initialize vlc in a subprocess, and return the vlc instance object
 */
function startVlc() {
    /* puts the arguments to vlc process in proper format */
    var pargs = [];

    if (options.communication !== undefined) {
		pargs.push('-I');
		pargs.push(options.communication);
    }

    if (options.port !== undefined) {
	    pargs.push('--http-port');
	    pargs.push(options.port);
    }

    if (options.password !== undefined) {
	    pargs.push('--http-password');
	    pargs.push(options.password);
    }

    /* start the vlc process */
    var player = child_process.spawn(options.player, pargs);

    //for now, send stderr to console.log
    player.stderr.on('data', function(data) {
	    console.error('ERROR ' + data);
    });

    //for now, send stdout to console.log
    player.stdout.on('data', function(data) {
	    console.log('OUT ' + data);
    });

    return player;
}

module.exports.startVlc = startVlc;
