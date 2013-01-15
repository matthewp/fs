var path = require('path');

function DirectoryEntry(fullPath, type) {
  this.path = fullPath;
  this.name = path.basename(fullPath);
  this.dir = path.dirname(fullPath);
  this.type = type;
}

module.exports = DirectoryEntry;