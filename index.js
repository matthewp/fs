exports = module.exports = (window.requestFileSystem || window.webkitRequestFileSystem)
  ? require('./filesystem')
  : require('./indexeddb');

exports.DirectoryEntry = require('./directory_entry');

exports.DirectoryEntry.prototype.readFile = function (callback) {
  if (this.type !== 'file') {
    throw new TypeError('Not a file.');
  }
  return exports.readFile(this.path, callback);
};
