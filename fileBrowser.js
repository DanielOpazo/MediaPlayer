var fs = require("fs");
var path = require("path");
var ffmpeg = require('fluent-ffmpeg');

/*
 * Schema definitions
 * Schema for folder objects:
 * "folders": [
    {
      "name":"<string>",
      "numItems":<int>
    }
*/
var FOLDERS_KEY = "folders";
var FOLDERS_DIR_KEY = "name";
var FOLDERS_DIR_NUM_ITEMS = "numItems"

/*
 * Schema for video objects
 * videos": [
 *  {
 *     "name":"<string>",
 *     "duration":<int>
 *  },
*/
var VIDEOS_KEY = "videos";
var VIDEOS_TITLE_KEY = "name";
var VIDEOS_LENGTH_KEY = "duration";

/*
 * Global list definitions
*/
var fileList = [];
var directoryList = [];

/*
 * Read metadata using ffmpeg
 * @param filePath (string) path to file to be queried
 * @param cb (function) callback function that is passed the metadata object
*/
function getMetaData(filePath, cb) {
    ffmpeg.ffprobe(filePath, function(err, metadata) {
        cb(metadata);
    });
}

/*
 * get file duration from ffmpeg metadata object
 * @param filePath (string) path to file to be queried
 * @param cb (function) callback function that is passed the file length (in seconds)
*/
function getMediaFileDuration(filePath, cb) {
    getMetaData(filePath, function(metadata) {
        cb(metadata["format"]["duration"]);
    });
}

//checks the file extension against the list of allowed filetypes
function validFile(file) {
    var extensionPatt = /\.mp4|mkv|avi|js$/i;
    return extensionPatt.test(file);
}

function resetLists () {
    fileList = [];
    directoryList = [];
}

/*
 * Get number of items in a directory.
 * This is a dumb length, in the sense that it doesn't do any
 * validation on what the items in the directory are. 
 * @param dirPath (string) relative path of directory to browse
 * @param cb (function) callback function to process result
*/
function getNumItemsInDir(dirPath, cb) {
    fs.readdir(dirPath, function (err, files) {
        if (err)
            cb(err);
        else
            cb(files.length);
    });
}

function addFileToList(pathToFile, fileName, cb) {
    if (validFile(pathToFile)) {
        getMediaFileDuration(pathToFile, function(duration) {
            var fileItem = {};
            fileItem[VIDEOS_TITLE_KEY] = fileName;
            fileItem[VIDEOS_LENGTH_KEY] = duration;
            fileList.push(fileItem);
            cb();
        });
    }else {
        cb();
    }
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
 * variable array fileList, or directoryList
 * @param dir (string) The directory to browse
 * @param files (array) The list of files/directories in the directory
 * @param goDeeper (boolean) Controls whether the browsing should go into 
 *                           subdirectories or not. If goDeeper is true,
                             every subdirectory will be browsed, and fileList
                             will contain the entire file tree, starting from dir.
 * @param cb (function) callback function. Lets the caller decide what to do once
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
                        //add the directory to the directoryList, then move on without going into the directory
                        //skip hidden folders
                        if (file[0] != '.') {
                            getNumItemsInDir(p, function(numItems) {
                                //no full paths for now
                                //if I want to use variables for my keys, I have to do this stupid
                                //multiline assignment to the object
                                var dirItem = {};
                                dirItem[FOLDERS_DIR_KEY] = file;
                                dirItem[FOLDERS_DIR_NUM_ITEMS] = numItems;
                                directoryList.push(dirItem);
                            });
                        }
                        handleFiles(dir, files, goDeeper, cb);
                    }
                }else if (stats.isFile()) {
                    addFileToList(p, file, function() {
                        //move on to the next file
                        handleFiles(dir, files, goDeeper, cb);
                    });
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
                    resetLists();
                    parseDir(dir, false, function (err) {
                        if (err)
                            console.error("Error parsing directory: " + dir);
                        else {
                            var dirInfo = {};
                            dirInfo[FOLDERS_KEY] = directoryList;
                            dirInfo[VIDEOS_KEY] = fileList;
                            cb(dirInfo);
                        }
                    });
                }
    }
}
