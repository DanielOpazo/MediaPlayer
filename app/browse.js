var express = require('express');
var router = express.Router();

const fb = require('./fileBrowser.js');

/* logger */
var winston = require('winston');
var logger = winston.loggers.get('browse');

router.get('/', function (req, res) {
    logger.info("received browse command from " + req.ip + " with url parameter dir = " + req.query.dir);
    //should probably validate the path somehow, It should be validated at the fileBrowser.js level though
    fb.browse(req.query.dir, function browseDir (err, retVal) {
        if (err) {
            logger.error("error browsing directory: " + req.query.dir);
            res.status(500).send('error browsing directory');
        } else {
            logger.info(retVal);
            res.json(retVal);
        }
    });
});

module.exports = router;
