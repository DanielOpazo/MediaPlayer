/*
 * created by Daniel Opazo, 2016/12/12
 */

/* child_process will be used to start the VLC process */
var child_process = require('child_process');
/* http is used to communicate with VLCs API */
var http = require('http');


/* Globals */
/* options passed to vlc when it is started, and the location of the executable */
options = {
	player: '/usr/bin/cvlc',
	communication: 'http',
	port : '9090',
	password: 'password'
};

/* module.exports allows this function to be called from another file
 * each command is returned as the value in an array, where the key is the name of the command
 * supported commands are:
 *  pause
 *  stop
 *  play
 */

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
		console.log('ERROR ' + data);
	});

	//for now, send stdout to console.log
	player.stdout.on('data', function(data) {
		console.log('OUT ' + data);
	});

    return player;
}

/* functions that talk to VLC   */

function close (player) {
    player.kill();
}

/* toggle pause/play */
function pause (cb) {
    apiCall(options, 'pl_pause', {}, cb);
}

function stop (cb) {
    apiCall(options, 'pl_stop', {}, cb);
}

function play (media, cb) {
    if (cb !== undefined) {
        apiCall(options, 'in_play', { input: media }, cb);
    }
    setTimeout(function() { //I don't like relying on timers
        apiCall(options, 'fullscreen', {}, undefined);
    }, 500);
}

function fullscreen (cb) {
    apiCall(options, 'fullscreen', {}, cb);
}

function emptyPlaylist(cb) {//basically stop
    apiCall(options, 'pl_empty', {}, cb);
}

function seek (seconds, cb) {
    apiCall(options, 'seek', { val: seconds }, cb);
}

function status (cb) { //not sure how frequently this should be queried
    apiCall(options, '', {}, function(res) { //need to handle an error here if vlc isn't running
        var full = '';
        res.on('data', function(data) {
            full += data.toString();
        });
        
        res.on('end', function(e) {
            cb(JSON.parse(full));
        });
    });
}

function volume (vol, cb) {
    apiCall(options, 'volume', { val: vol }, cb);
}

/* externally visible functions */
module.exports.emptyPlaylist = emptyPlaylist;
module.exports.fullscreen = fullscreen;
module.exports.startVlc = startVlc
module.exports.pause = pause;
module.exports.play = play;
module.exports.seek = seek;
module.exports.status = status;
module.exports.stop = stop;
module.exports.volume = volume;

/* Call the vlc api
 * @param {options} options "The options to configure the vlc http server"
 * @param {string} command "The command given to the vlc server"
 * @param {array} args "The arguments for the given command"
 * @param {Function} callback "The callback function which is passed the response from the vlc server"
*/

function apiCall(options, command, args, callback) {
	var urlArgs = '';

	/* put the arguments into the proper form for the http get */
	for (var key in args) {
		urlArgs = '&' + encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
	}

    command = '?command=' + command;
	
	//debug	
	console.log(command + urlArgs);

	/* call the vlc api using http */
	http.get({
		hostname: 'localhost',
		port: options.port,
		path: '/requests/status.json' + command + urlArgs,
		auth: ':' + options.password,
		agent: false
	}, function (res) {//this needs to handle the error if vlc isn't running
		if (callback !== undefined) {
			callback(res);
		}
	});	
}





