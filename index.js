import { readFile } from './indexeddb';
import DirectoryEntry from './directory_entry';

DirectoryEntry.prototype.readFile = function (callback) {
  if (this.type !== 'file') {
    throw new TypeError('Not a file.');
  }
  return readFile(this.path, callback);
};

export * from './indexeddb';
export { DirectoryEntry };
