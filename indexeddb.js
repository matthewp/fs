var path = require('path');

var DB_NAME = window.location.host + '_filesystem',
    OS_NAME = 'files',
    DIR_IDX = 'dir';

function init(callback) {
  var req = window.indexedDB.open(DB_NAME, 1);

  req.onupgradeneeded = function (e) {
    var db = e.target.result;

    var objectStore = db.createObjectStore(OS_NAME, { keyPath: 'path' });
    objectStore.createIndex(DIR_IDX, 'dir', { unique: false });
  };

  req.onsuccess = function (e) {
    callback(e.target.result);
  };
}

function initOS(type, callback) {
  init(function (db) {
    var trans = db.transaction([OS_NAME], type),
        os = trans.objectStore(OS_NAME);

    callback(os);
  });
}

exports.readFile = function (fileName, callback) {
  initOS('readonly', function (os) {
    var req = os.get(fileName);

    req.onerror = function (e) {
      callback(e);
    };

    req.onsuccess = function (e) {
      var res = e.target.result;

      if (res && res.data) {
        callback(null, res.data);
      } else {
        callback('File not found');
      }     
    };
  });
};

exports.writeFile = function (fileName, data, callback) {
  initOS('readwrite', function (os) {
    var req = os.put({
      "path": fileName,
      "dir": path.dirname(fileName),
      "type": "file",
      "data": data
    });

    req.onerror = function (e) {
      callback(e);
    };

    req.onsuccess = function (e) {
      callback(null);
    };
  });
};

exports.removeFile = function (fileName, callback) {
  initOS('readwrite', function (os) {
    var req = os.delete(fileName);

    req.onerror = req.onsuccess = function (e) {
      callback();
    };
  });
};

exports.readdir = function (directoryName, callback) {
  initOS('readonly', function (os) {
    var directoryWithTrailingSlash = directoryName[directoryName.length - 1] === '/'
      ? directoryName
      : directoryName + '/';
    var dir = path.dirname(directoryWithTrailingSlash);

    var idx = os.index(DIR_IDX);
    var range = IDBKeyRange.only(dir);
    var req = idx.openCursor(range);

    req.onerror = function (e) {
      callback(e);
    };

    var results = [];
    req.onsuccess = function (e) {
      var cursor = e.target.result;
      if (cursor) {
        var value = cursor.value;
        var entry = new exports.DirectoryEntry(value.path, value.type);
        results.push(entry);
        cursor.continue();
      } else {
        callback(null, results);
      }
    };
  });
};