var fs = require("fs");
var path = require("path");

var fileList = [];
var fileTypeEnum = {
    TYPE_FILE : 1,
    TYPE_DIR : 2
}

//checks the file extension against the list of allowed filetypes
function validFile(file) {
    var extensionPatt = /\.mp4|mkv|avi|js$/i;
    return extensionPatt.test(file);
}

/* depth first recursive file list
 * goDeeper controls if subdirectories should be followed or not.
 * if it's false, it will simply add the directory, just like it lists files
 */
function parseDir(dir, goDeeper, cb) {
    fs.readdir(dir, function (err, files) {
        if (err)
            cb(err);
        else
            handleFiles(dir, files, goDeeper, cb);
    });
}

/* helper function for parseDir.
 * handles files/directories one at a time, then moves to the
 * next one by invoking itself again
 */
function handleFiles(dir, files, goDeeper, cb) {
    var file = files.shift();
    if (file) {
        var p = path.join(dir, file);
        fs.stat(p, function(err, stats) {
            if (err)
                cb(err);
            else {
                if (stats.isDirectory()) {
                    if (goDeeper) {
                        //parse the directory then
                        parseDir(p, goDeeper, function(err) {
                            if (err)
                                cb(err);
                            else
                                handleFiles(dir, files, goDeeper, cb);
                        });
                    }else {
                        //add the directory to the fileList, then move on without going into the directory
                        fileList[p] = fileTypeEnum.TYPE_DIR;
                        handleFiles(dir, files, goDeeper, cb);
                    }
                }else if (stats.isFile()) {
                    if (validFile(p))
                        fileList[p] = fileTypeEnum.TYPE_FILE;
                    //move on to the next file
                    handleFiles(dir, files, goDeeper, cb);
                }
            }
        });
    }else {
        cb();
    }
}

parseDir('.', false, function (err) {
    if (err)
        console.error(err);
    else {
        console.log(fileList);
    }
});

            
