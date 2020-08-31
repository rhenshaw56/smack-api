const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// container

const lib = {};

// base directory
lib.basedir = path.join(__dirname, '/../.data/');

lib.create = (dir, file, data, cb) => {
  // open file for writing
  console.log('this', lib.basedir);
  fs.open(`${lib.basedir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // convert data to string
      const stringData = JSON.stringify(data);

      // write to file and close it
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              cb(false);
            } else {
              cb('Error closing new file');
            }

          });
        } else {
          cb('Error writing to new file');
        }
      });
    } else {
      cb('Could not create new file,, it may already exist')
    }
  });
};

// read data

lib.read = (dir, file, cb) => {
  fs.readFile(`${lib.basedir}${dir}/${file}.json`, 'utf-8', (err, data) => {
    if (!err && data) {
      const parsedData = helpers.parseJSONToObject(data);
      cb(false, parsedData);
    } else {
      cb(err, data);
    }
  });
};

lib.update = (dir, file, data, cb) => {
  // open file for writing r+ ==> open for writes if file exists
  fs.open(`${lib.basedir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);

      // Truncate file
      fs.truncate(fileDescriptor, (err) => {
        if(!err) {
          // write to file and close it
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if (!err) {
              fs.close(fileDescriptor, (err) => {
                if (!err) {
                  cb(false);
                } else {
                  cb('Error closing file during update')
                }
              });
            } else {
              cb('Error writing to existing file')
            }
          })
        } else {
          cb('Error truncating file');
        }
      });
    } else {
      cb('Could not open the file for updating, it may not exist yet');
    }
  });
};

lib.delete = (dir, file, cb) => {
  fs.unlink(`${lib.basedir}${dir}/${file}.json`, (err) => {
    if (!err) {
      cb(false);
    } else {
      cb('Error deleting file')
    }
  });
};

module.exports = lib;