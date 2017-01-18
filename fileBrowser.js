var fs = require("fs");
var path = require("path");

/* The current directory listing. Each entry in the array
 * has a key of a string file or directory name, and a value
 * of type fileTypeEnum, that indicates if the entry is a file
 * or a directory
*/
var fileList = {};
var fileTypeEnum = {
    TYPE_FILE : 1,
    TYPE_DIR : 2
}

//checks the file extension against the list of allowed filetypes
function validFile(file) {
    var extensionPatt = /\.mp4|mkv|avi|js$/i;
    return extensionPatt.test(file);
}

function resetFileList () {
    fileList = {};
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
 * next one by invoking itself again.
 * If the file/directory passes validation, it is added to the global
 * variable array fileList
 * @param dir (string) The directory to browse
 * @param files (array) The list of files/directories in the directory
 * @param goDeeper (boolean) Controls whether the browsing should go into 
 *                           subdirectories or not. If goDeeper is true,
                             every subdirectory will be browsed, and fileList
                             will contain the entire file tree, starting from dir.
 * @paramn cb (function) callback function. Lets the caller decide what to do once
                         the directory has been browsed, and fileList is filled 
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

/*
 * externally visible function. Called in appAPI.js when a GET request to
 * /browse is made
 */
var exports = module.exports = function() {
    return {
        browse: function (dir, cb) {
                    resetFileList();
                    parseDir(dir, false, function (err) {
                        if (err)
                            console.error(fileList);
                        else {
                            cb(JSON.stringify(fileList));
                        }
                    });
                }
    }
}
