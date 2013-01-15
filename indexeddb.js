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

var dirRegExp = /[\/]{1}([^\/]+[\/])*([^\/]*)/;
var writeObject = function (name, type, data, callback) {
  initOS('readwrite', function (os) {
    var dir = fileName.match(dirRegExp);

    var req = os.put({
      "path": fileName,
      "dir": (dir && dir[0]) || '/',
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

exports.writeFile = function (fileName, data, callback) {
  initOS('readwrite', function (os) {
    var dir = fileName.match(dirRegExp);
    if (dir) {
      console.log(dir[1]);
    }

    var req = os.put({
      "path": fileName,
      "dir": (dir && dir[1]) || '/',
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
    var idx = os.index(DIR_IDX);
    var range = IDBKeyRange.only(directoryName);
    var req = idx.openCursor(range);

    req.onerror = function (e) {
      callback(e);
    };

    var results = [];
    req.onsuccess = function (e) {
      var cursor = e.target.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        callback(null, results);
      }
    };
  });
};