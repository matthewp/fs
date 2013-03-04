;(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error("Cannot find module '"+r+"'")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!=="undefined"&&require,{1:[function(require,module,exports){module.exports = (window.requestFileSystem || window.webkitRequestFileSystem)
  ? require('./filesystem')
  : require('./indexeddb');

module.exports.DirectoryEntry = require('./directory_entry');

module.exports.DirectoryEntry.prototype.readFile = function (callback) {
  if (this.type !== 'file') {
    throw new TypeError('Not a file.');
  }
  return module.exports.readFile(this.path, callback);
};
},{"./filesystem":2,"./indexeddb":3,"./directory_entry":4}],2:[function(require,module,exports){var fs = null;
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
    var readdir = function (dirEntry) {
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
    };

    if(['','.','/'].indexOf(directoryName) !== -1) {
      readdir(fs.root);
    } else {
      fs.root.getDirectory(directoryName, { create: true }, readdir);
    }
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

},{}],3:[function(require,module,exports){var path = require('path');

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

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

var readFile = function (fileName, callback) {
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

exports.readFile = function (fileName, callback) {
  readFile(fileName, function (err, data) {
    if (!err && !(data instanceof ArrayBuffer)) {
      data = str2ab(data.toString());
    }
    callback(err, data);
  });
};

exports.readString = function (fileName, callback) {
  readFile(fileName, function (err, data) {
    if (!err && (data instanceof ArrayBuffer)) {
      data = ab2str(data);
    }
    callback(err, data);
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

function withTrailingSlash(path) {
  var directoryWithTrailingSlash = path[path.length - 1] === '/'
    ? path
    : path + '/';
  return directoryWithTrailingSlash;
}

exports.readdir = function (directoryName, callback) {
  initOS('readonly', function (os) {
    var dir = path.dirname(withTrailingSlash(directoryName));

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

exports.mkdir = function (fullPath, callback) {
  initOS('readwrite', function (os) {
    var dir = withTrailingSlash(path);
   
    var req = os.put({
      "path": fullPath,
      "dir": path.dirname(dir),
      "type": "directory"
    });

    req.onerror = function (e) {
      callback(e);
    };

    req.onsuccess = function (e) {
      callback(null);
    };
  });
};

exports.rmdir = function (fullPath, callback) {
  exports.readdir(fullPath, function removeFiles(files) {
    if (!files || !files.length) {
      return exports.removeFile(fullPath, callback);
    }

    var file = files.shift(),
        func = file.type === 'directory'
          ? exports.rmdir
          : exports.removeFile;

    func(file.name, function () {
      removeFiles(files);
    });
  });
};
},{"path":5}],4:[function(require,module,exports){var path = require('path');

function DirectoryEntry(fullPath, type) {
  this.path = fullPath;
  this.name = path.basename(fullPath);
  this.dir = path.dirname(fullPath);
  this.type = type;
}

module.exports = DirectoryEntry;
},{"path":5}],6:[function(require,module,exports){// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],5:[function(require,module,exports){(function(process){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

})(require("__browserify_process"))
},{"__browserify_process":6}]},{},[1]);