var fs = null;
function ensureSize(size, then) {
  var rFS = window.requestFileSystem
    || window.webkitRequestFileSystem;

  var pers = window.PERSISTENT;

  window.webkitStorageInfo.requestQuota(pers, size, function (grantedBytes) {
    rFS(pers, grantedBytes, function (fss) {
      fs = fss;
      then(fs);
    });
  });
}

function init(then) {
  if (fs) {
    then(fs); return;
  }

  ensureSize(1024 * 1024, then);
}

var readFile = function (fileName, callback, readMethod) {
  init(function (fs) {
    fs.root.getFile(fileName, {},
      function onSuccess(fileEntry) {
        fileEntry.file(function (file) {
          var reader = new FileReader();

          reader.onloadend = function (e) {
            callback(null, this.result);
          };

          reader[readMethod](file);
        });
      },
      function onError(err) {
        callback(err);
      });
  });
}

exports.readFile = function (fileName, callback) {
  return readFile(fileName, callback, 'readAsArrayBuffer');
};

exports.readString = function (fileName, callback) {
  return readFile(fileName, callback, 'readAsText');
};

exports.writeFile = function (fileName, data, callback) {
  if (!Array.isArray(data)
    && !(data instanceof File)) {
    if (data instanceof ArrayBuffer) {
      var view = new Uint8Array(data);
      data = new Blob([view]);
    } else {
      data = new Blob([data]);
    }
  }

  ensureSize(data.size, function (fs) {
    fs.root.getFile(fileName, { create: true }, function (fileEntry) {
      fileEntry.createWriter(function (fileWriter) {
        var err = null;
        fileWriter.onwriteend = function (e) {
          callback(err);
        };

        fileWriter.onerror = function (e) {
          err = e.toString();
        };

        fileWriter.write(data);
      });
    }, function onError(err) {
      callback(err);
    });
  });
};

exports.removeFile = function (fileName, callback) {
  init(function (fs) {
    fs.root.getFile(fileName, { create: false }, function (fileEntry) {
      fileEntry.remove(callback);
    }, callback);
  });
};

exports.readdir = function (directoryName, callback) {
  init(function (fs) {
    fs.root.getDirectory(directoryName, { create: true }, function (dirEntry) {
      if (!dirEntry.isDirectory) {
        callback('Not a directory'); return;
      }

      var dirReader = dirEntry.createReader(), entries = [];
      var readEntries = function () {
        dirReader.readEntries(function (results) {
          if (!results.length) {
            callback(null, entries);
          } else {
            results = Array.prototype.slice.call(results || []);
            entries = entries.concat(results.map(function(result) {
              return new exports.DirectoryEntry(result.fullPath,
                result.isDirectory ? 'directory' : 'file');
            }));
            readEntries();
          }
        });
      };

      readEntries();
    });
  });
};

exports.mkdir = function (path, callback) {
  init(function (fs) {
    fs.root.getDirectory(path, { create: true }, function () {
      callback();
    }, function (err) {
      callback(err);
    });
  });
};

exports.rmdir = function (path, callback) {
  init(function (fs) {
    fs.root.getDirectory(path, {}, function (dirEntry) {
      dirEntry.remove(callback);
    });
  });
};