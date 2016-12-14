/*
 * created by Daniel Opazo, 2016/12/12
*/

/* child_process will be used to start the VLC process */
var child_process = require('child_process');
/* http is used to communicate with VLCs API */
var http = require('http');

/* options passed to vlc when it is started, and the location of the executable */
options = {
	player: '/usr/bin/cvlc',
	communication: 'http',
	port : '8080',
	password: 'password'
};

/* puts the arguments to vlc in proper format */
var pargs = [];

if (options.communication !== undefined) {
	pargs.push('-I');
	pargs.push(options.communication);
}

if (options.port !== undefined) {
	pargs.push('--http-port');
	pargs.push(options.port);
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
	console.log('ERROR ' + data);
});


/* Call the vlc api
*/

function apiCall(options, command, args, callback) {
	var urlArgs = '';

	/* put the arguments into the proper form for the http get */
	for (var key in args) {
		urlArgs = '&' + encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
	}

	if (command !== undefined) {
		command = '?command=' + command;
	}else { //this should be handled better
		console.log('ERROR command is undefined');
		return;
	}
	
	/* call the vlc api using http */
	http.get({
		hostname: 'localhost',
		port: options.port,
		path: '/requests/status.json' + commands + urlArgs,
		auth: ':' + options.password,
		agent: false
	}, function (res) {
		if (callback !== undefined) {
			callback(res);
		}
	});	
}





