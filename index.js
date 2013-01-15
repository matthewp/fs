module.exports = (window.requestFileSystem || window.webkitRequestFileSystem)
  ? require('./filesystem')
  : require('./indexeddb');

module.exports.DirectoryEntry = require('./directory_entry');

module.exports.DirectoryEntry.prototype.readFile = function (callback) {
  if (this.type !== 'file') {
    throw new TypeError('Not a file.');
  }
  return module.exports.readFile(this.path, callback);
};