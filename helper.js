const fs = require('fs');

const helper = {
    fileExt: function (file) {
        return file.substr(file.lastIndexOf('.') + 1);
    },
    fileNameWithoutExt: function(file) {
        return file.split('.').slice(0, -1).join('.');
    },
    fileNameFromPath: function(path) {
        return path.replace(/^.*[\\\/]/, '');
    },
    isDir: function(path) {
        return fs.lstatSync(path).isDirectory();
    }
}

module.exports = helper;