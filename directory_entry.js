import path from 'path';

function DirectoryEntry(fullPath, type) {
  this.path = fullPath;
  this.name = path.basename(fullPath);
  this.dir = path.dirname(fullPath);
  this.type = type;
}

export { DirectoryEntry as default };
