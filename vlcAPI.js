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
	port : '8080'
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
