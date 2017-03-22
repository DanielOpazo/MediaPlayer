/*
 * created by Daniel Opazo, 2016/12/12
 */

/* child_process will be used to start the VLC process */
var child_process = require('child_process');
/* http is used to communicate with VLCs API */
var http = require('http');

/* module.exports allows this function to be called from another file
 * each command is returned as the value in an array, where the key is the name of the command
 * supported commands are:
 *  pause
 *  stop
 *  play
 */
var exports = module.exports = function() {
	/* options passed to vlc when it is started, and the location of the executable */
	options = {
		player: '/usr/bin/cvlc',
		communication: 'http',
		port : '9090',
		password: 'password'
	};

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
    
    /* externally accessible */
    return {
        options: options,
        _player: player,
        close: function() {
            player.kill();
        },
        pause: function(cb) { //this is a toggle. to resume, send same request
                apiCall(options, 'pl_pause', {}, cb);
        },
        stop: function(cb) {
            apiCall(options, 'pl_stop', {}, cb);
        },
        play: function(media, cb) {
            if (cb !== undefined) {
                apiCall(options, 'in_play', {
                    input: media
                    }
                , cb);
            }
        },
        fullscreen: function(cb) {
            apiCall(options, 'fullscreen', {}, cb);
        }
    };
};


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
	}, function (res) {
		if (callback !== undefined) {
			callback(res);
		}
	});	
}





