var fs = require('fs')
var path = require('path')
var ffmpeg = require('fluent-ffmpeg')
var async = require('async')

/* logger */
var winston = require('winston')
var logger = winston.loggers.get('vlcControl')

/*
 * Schema definitions
 * Schema for folder objects:
 * "folders": [
    {
      "name":"<string>",
      "numItems":<int>
    }
*/
var FOLDERS_KEY = 'folders'
var FOLDERS_DIR_KEY = 'name'
var FOLDERS_DIR_NUM_ITEMS = 'numItems'

/*
 * Schema for video objects
 * videos": [
 *  {
 *     "name":"<string>",
 *     "duration":<int>
 *  },
*/
var VIDEOS_KEY = 'videos'
var VIDEOS_TITLE_KEY = 'name'
var VIDEOS_LENGTH_KEY = 'duration'

/*
 * Global list definitions
*/
var fileList = []
var directoryList = []

function resetLists () {
  fileList = []
  directoryList = []
}

/*
 * Read metadata using ffmpeg
 * @param filePath (string) path to file to be queried
 * @param cb (function) callback function that is passed the metadata object
*/
// doesn't handle error
function getMetaData (filePath, cb) {
  ffmpeg.ffprobe(filePath, function (err, metadata) {
    if (err) {
      logger.error('ffmpeg cannot get metadata for file: ' + filePath)
      cb(null)
    } else { cb(metadata) }
  })
}

/*
 * get file duration from ffmpeg metadata object
 * @param filePath (string) path to file to be queried
 * @param cb (function) callback function that is passed the file duration (in seconds)
*/
function getMediaFileDuration (filePath, cb) {
  getMetaData(filePath, function (metadata) {
    cb(metadata ? metadata['format']['duration'] : 0)
  })
}

// checks the file extension against the list of allowed filetypes
// what if file is null here
function validFileType (file) {
  var extensionPatt = /\.mp4|mkv|avi$/i
  return extensionPatt.test(file)
}

function addFileToList (filePath, fileName, cb) {
  if (validFileType(filePath)) {
    getMediaFileDuration(filePath, function (duration) {
      var fileItem = {}
      fileItem[VIDEOS_TITLE_KEY] = fileName
      fileItem[VIDEOS_LENGTH_KEY] = duration
      fileList.push(fileItem)
      cb()
    })
  } else {
    cb()
  }
}

function addDirectoryToList (err, dirPath, dirName, numItems, cb) {
  if (err) {
    logger.error('error getting number of items in directory: ' + dirPath)
  } else {
    // don't send full paths, just file name
    // add item to global dirItem array
    var dirItem = {}
    dirItem[FOLDERS_DIR_KEY] = dirName
    dirItem[FOLDERS_DIR_NUM_ITEMS] = numItems
    directoryList.push(dirItem)
  }
  cb()
}

/*
 * @param dirPath (string) relative path of directory to browse
 * @param cb (function) callback function to process result
*/
function getNumItemsInDir (dirPath, cb) {
  fs.readdir(dirPath, function handleFiles (err, files) {
    if (err) {
      logger.error('error reading directory: ' + dirPath)
      cb(err, null)
    } else {
      var count = 0
      async.each(files, function countFile (fileName, callback) {
        var p = path.join(dirPath, fileName)
        fs.stat(p, function handleItemStats (err, stats) {
          if (err) {
            logger.error('error getting directory stats for: ' + p)
            callback(err)
          } else {
            if ((stats.isDirectory() && fileName[0] !== '.') || (stats.isFile() && validFileType(fileName))) { count++ }
            callback()
          }
        })
      }, function handledEveryItemOrError (err) {
        if (err) { cb(err, null) } else {
          cb(null, count)
        }
      })
    }
  })
}

/* depth first recursive file list
 * goDeeper controls if subdirectories should be followed or not.
 * if it's false, it will simply add the directory, just like it lists files
 * cb has one optional parameter: err
 */
function parseDir (dir, goDeeper, cb) {
  fs.readdir(dir, function (err, files) {
    if (err) {
      logger.error('error reading directory: ' + dir)
      cb(err)
    } else { handleFiles(dir, files, goDeeper, cb) }
  })
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
 * @param cb (function) callback function. Can be invoked with cb(err) in case of error,
 *                      or cb() for success
 * Note: I considered refactoring this function, but I thought it made the control flow
 *       harder to read if I moved the recursive calls to their own functions.
 */
function handleFiles (dir, files, goDeeper, cb) {
  var file = files.shift()
  if (file) {
    var p = path.join(dir, file)
    fs.stat(p, function handleDirectoryInfo (err, stats) {
      if (err) {
        logger.error('error reading directory information: ' + p)
        handleFiles(dir, files, goDeeper, cb)
      } else {
        if (stats.isDirectory()) {
          if (goDeeper) {
            // parse the directory then
            // pretty sure I could replace all this with parseDir(p, goDeeper, cb);
            parseDir(p, goDeeper, function (err) {
              if (err) { cb(err) } else { handleFiles(dir, files, goDeeper, cb) }
            })
          } else {
            // add the directory to the directoryList, then move on without going into the directory
            // skip hidden folders
            if (file[0] !== '.') {
              getNumItemsInDir(p, function (err, numItems) {
                addDirectoryToList(err, p, file, numItems, function () {
                  handleFiles(dir, files, goDeeper, cb)
                })
              })
            } else { // move on to the next file/folder
              handleFiles(dir, files, goDeeper, cb)
            }
          }
        } else if (stats.isFile()) {
          addFileToList(p, file, function () {
            // move on to the next file
            handleFiles(dir, files, goDeeper, cb)
          })
        } else {
          logger.info('item is neither a directory nor a file: ' + p)
          handleFiles(dir, files, goDeeper, cb)
        }
      }
    })
  } else { // processed all the files
    cb()
  }
}

/* cb can be invoked with cb(err, null) in case of an error, or cb(null, dirInfo) for success */
function browse (dir, cb) {
  resetLists()
  parseDir(dir, false, function (err) {
    if (err) {
      logger.error('Error parsing directory: ' + dir)
      cb(err, null)
    } else {
      var dirInfo = {}
      dirInfo[FOLDERS_KEY] = directoryList
      dirInfo[VIDEOS_KEY] = fileList
      cb(null, dirInfo)
    }
  })
}

/*
 * externally visible function. Called in appAPI.js when a GET request to
 * /browse is made
 */
module.exports.browse = browse
