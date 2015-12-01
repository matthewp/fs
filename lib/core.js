import path from 'path';
import DirectoryEntry from './directory_entry';

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str) {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

const DB_NAME = window.location.host + '_filesystem',
    OS_NAME = 'files',
    DIR_IDX = 'dir';

function init(callback) {
  const req = window.indexedDB.open(DB_NAME, 1);

  req.onupgradeneeded = function (e) {
    const db = e.target.result;

    const objectStore = db.createObjectStore(OS_NAME, { keyPath: 'path' });
    objectStore.createIndex(DIR_IDX, 'dir', { unique: false });
  };

  req.onsuccess = function (e) {
    callback(e.target.result);
  };
}

function initOS(type, callback) {
  init(function (db) {
    const trans = db.transaction([OS_NAME], type),
        os = trans.objectStore(OS_NAME);

    callback(os);
  });
}

let readFrom = function (fileName) {
  return new Promise(function(resolve, reject){
    initOS('readonly', function (os) {
      const req = os.get(fileName);

      req.onerror = reject;

      req.onsuccess = function (e) {
        const res = e.target.result;

        if (res && res.data) {
          resolve(res.data);
        } else {
          reject('File not found');
        }
      };
    });
  });
};

export function readFile(fileName) {
  return readFrom(fileName).then(function (data) {
    if (!(data instanceof ArrayBuffer)) {
      data = str2ab(data.toString());
    }
    return data;
  });
}

export function readString(fileName) {
  return readFrom(fileName).then(function(data) {
    if ((data instanceof ArrayBuffer)) {
      data = ab2str(data);
    }
    return data;
  });
};

export function writeFile(fileName, data) {
  return new Promise(function(resolve, reject){
    initOS('readwrite', function (os) {
      const req = os.put({
        "path": fileName,
        "dir": path.dirname(fileName),
        "type": "file",
        "data": data
      });

      req.onerror = reject;

      req.onsuccess = function (e) {
        resolve();
      };
    });
  });
};

export function removeFile(fileName) {
  return new Promise(function(resolve){
    initOS('readwrite', function (os) {
      const req = os.delete(fileName);

      req.onerror = req.onsuccess = function (e) {
        resolve();
      };
    });
  });
};

function withTrailingSlash(path) {
  const directoryWithTrailingSlash = path[path.length - 1] === '/'
    ? path
    : path + '/';
  return directoryWithTrailingSlash;
}

export function readdir(directoryName) {
  return new Promise(function(resolve, reject){
    initOS('readonly', function (os) {
      const dir = path.dirname(withTrailingSlash(directoryName));

      const idx = os.index(DIR_IDX);
      const range = IDBKeyRange.only(dir);
      const req = idx.openCursor(range);

      req.onerror = function (e) {
        reject(e);
      };

      const results = [];
      req.onsuccess = function (e) {
        const cursor = e.target.result;
        if (cursor) {
          const value = cursor.value;
          const entry = new DirectoryEntry(value.path, value.type);
          results.push(entry);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
    });
  });
};

export function mkdir(fullPath) {
  return new Promise(function(resolve, reject){
    initOS('readwrite', function (os) {
      const dir = withTrailingSlash(path);

      const req = os.put({
        "path": fullPath,
        "dir": path.dirname(dir),
        "type": "directory"
      });

      req.onerror = reject;

      req.onsuccess = function (e) {
        resolve();
      };
    });
  });
};

export function rmdir(fullPath) {
  return readdir(fullPath)
    .then(function removeFiles(files) {
      if (!files || !files.length) {
        return removeFile(fullPath);
      }

      const file = files.shift(),
          func = file.type === 'directory'
            ? rmdir
            : removeFile;

      return func(file.name).then(function () {
        return removeFiles(files);
      });
    });
};
