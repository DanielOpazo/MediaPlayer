var winston = require('winston');

/*
 * categories for logging: vlcProcess, vlcControl, fileBrowser, command, browse, appAPI
*/

const LOG_DIR = "log/";
var commonOptions = {
    timestamp: dateFormat,
    maxsize: 1048576,
    maxFiles: 10,
    json: false,
    tailable: true,
    zippedArchive: true,
    prettyPrint: true
}

/* id of each module that will have a logger */
var ids = ["vlcProcess"]

var loggers = {};

/* create the info and error logger configs for each module */
ids.forEach(function (id, index) {
    loggers[id] = generateTransportConfig(id);
});

/* add loggers to winston.loggers */
Object.keys(loggers).forEach(function (id) {
    copyOverCommonOptions(loggers[id]['info'], commonOptions);
    copyOverCommonOptions(loggers[id]['error'], commonOptions);
    winston.loggers.add(id, { 
        transports: [
            new (winston.transports.File) (
                loggers[id]['info']
            ),
            new (winston.transports.File) (
                loggers[id]['error']
            )
        ]
    });
});

function generateTransportConfig(id) {
    return {
        info: generateTransportConfigForLevel(id, 'info'),
        error: generateTransportConfigForLevel(id, 'error')
    };
}

function generateTransportConfigForLevel(id, level) {
    return {
        name: level + '-file',
        filename: LOG_DIR + id + '-' + level + '.log',
        level: level,
        showLevel: showLevel(level)
    }
}

function showLevel(level) {
    switch (level) {
        case 'info':
            return true;
            break;
        case 'error':
            return false;
            break;
        default:
            return true;
            break;
    }
}

function dateFormat() {
    var date = new Date();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

function copyOverCommonOptions(options, commonOptions) {
    Object.keys(commonOptions).forEach(function (key) {
        options[key] = commonOptions[key];
    });
}
