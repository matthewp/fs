/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("component-path/index.js", Function("module, exports, require",
"\nexports.basename = function(path){\n  return path.split('/').pop();\n};\n\nexports.dirname = function(path){\n  return path.split('/').slice(0, -1).join('/') || '.'; \n};\n\nexports.extname = function(path){\n  var base = exports.basename(path);\n  if (!~base.indexOf('.')) return '';\n  var ext = base.split('.').pop();\n  return '.' + ext;\n};//@ sourceURL=component-path/index.js"
));
require.register("fs/index.js", Function("module, exports, require",
"module.exports = (window.requestFileSystem || window.webkitRequestFileSystem)\n  ? require('./filesystem')\n  : require('./indexeddb');\n\nmodule.exports.DirectoryEntry = require('./directory_entry');\n\nmodule.exports.DirectoryEntry.prototype.readFile = function (callback) {\n  if (this.type !== 'file') {\n    throw new TypeError('Not a file.');\n  }\n  return module.exports.readFile(this.path, callback);\n};//@ sourceURL=fs/index.js"
));
require.register("fs/directory_entry.js", Function("module, exports, require",
"var path = require('path');\n\nfunction DirectoryEntry(fullPath, type) {\n  this.path = fullPath;\n  this.name = path.basename(fullPath);\n  this.dir = path.dirname(fullPath);\n  this.type = type;\n}\n\nmodule.exports = DirectoryEntry;//@ sourceURL=fs/directory_entry.js"
));
require.register("fs/filesystem.js", Function("module, exports, require",
"var fs = null;\nfunction ensureSize(size, then) {\n  var rFS = window.requestFileSystem\n    || window.webkitRequestFileSystem;\n\n  var pers = window.PERSISTENT;\n\n  window.webkitStorageInfo.requestQuota(pers, size, function (grantedBytes) {\n    rFS(pers, grantedBytes, function (fss) {\n      fs = fss;\n      then(fs);\n    });\n  });\n}\n\nfunction init(then) {\n  if (fs) {\n    then(fs); return;\n  }\n\n  ensureSize(1024 * 1024, then);\n}\n\nvar readFile = function (fileName, callback, readMethod) {\n  init(function (fs) {\n    fs.root.getFile(fileName, {},\n      function onSuccess(fileEntry) {\n        fileEntry.file(function (file) {\n          var reader = new FileReader();\n\n          reader.onloadend = function (e) {\n            callback(null, this.result);\n          };\n\n          reader[readMethod](file);\n        });\n      },\n      function onError(err) {\n        callback(err);\n      });\n  });\n}\n\nexports.readFile = function (fileName, callback) {\n  return readFile(fileName, callback, 'readAsArrayBuffer');\n};\n\nexports.readString = function (fileName, callback) {\n  return readFile(fileName, callback, 'readAsText');\n};\n\nexports.writeFile = function (fileName, data, callback) {\n  if (!Array.isArray(data)\n    && !(data instanceof File)) {\n    if (data instanceof ArrayBuffer) {\n      var view = new Uint8Array(data);\n      data = new Blob([view]);\n    } else {\n      data = new Blob([data]);\n    }\n  }\n\n  ensureSize(data.size, function (fs) {\n    fs.root.getFile(fileName, { create: true }, function (fileEntry) {\n      fileEntry.createWriter(function (fileWriter) {\n        var err = null;\n        fileWriter.onwriteend = function (e) {\n          callback(err);\n        };\n\n        fileWriter.onerror = function (e) {\n          err = e.toString();\n        };\n\n        fileWriter.write(data);\n      });\n    }, function onError(err) {\n      callback(err);\n    });\n  });\n};\n\nexports.removeFile = function (fileName, callback) {\n  init(function (fs) {\n    fs.root.getFile(fileName, { create: false }, function (fileEntry) {\n      fileEntry.remove(callback);\n    }, callback);\n  });\n};\n\nexports.readdir = function (directoryName, callback) {\n  init(function (fs) {\n    var readdir = function (dirEntry) {\n      if (!dirEntry.isDirectory) {\n        callback('Not a directory'); return;\n      }\n\n      var dirReader = dirEntry.createReader(), entries = [];\n      var readEntries = function () {\n        dirReader.readEntries(function (results) {\n          if (!results.length) {\n            callback(null, entries);\n          } else {\n            results = Array.prototype.slice.call(results || []);\n            entries = entries.concat(results.map(function(result) {\n              return new exports.DirectoryEntry(result.fullPath,\n                result.isDirectory ? 'directory' : 'file');\n            }));\n            readEntries();\n          }\n        });\n      };\n\n      readEntries();\n    };\n\n    if(['','.','/'].indexOf(directoryName) !== -1) {\n      readdir(fs.root);\n    } else {\n      fs.root.getDirectory(directoryName, { create: true }, readdir);\n    }\n  });\n};\n\nexports.mkdir = function (path, callback) {\n  init(function (fs) {\n    fs.root.getDirectory(path, { create: true }, function () {\n      callback();\n    }, function (err) {\n      callback(err);\n    });\n  });\n};\n\nexports.rmdir = function (path, callback) {\n  init(function (fs) {\n    fs.root.getDirectory(path, {}, function (dirEntry) {\n      dirEntry.remove(callback);\n    });\n  });\n};\n//@ sourceURL=fs/filesystem.js"
));
require.register("fs/indexeddb.js", Function("module, exports, require",
"var path = require('path');\n\nfunction ab2str(buf) {\n  return String.fromCharCode.apply(null, new Uint16Array(buf));\n}\nfunction str2ab(str) {\n  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char\n  var bufView = new Uint16Array(buf);\n  for (var i = 0, strLen = str.length; i < strLen; i++) {\n    bufView[i] = str.charCodeAt(i);\n  }\n  return buf;\n}\n\nvar DB_NAME = window.location.host + '_filesystem',\n    OS_NAME = 'files',\n    DIR_IDX = 'dir';\n\nfunction init(callback) {\n  var req = window.indexedDB.open(DB_NAME, 1);\n\n  req.onupgradeneeded = function (e) {\n    var db = e.target.result;\n\n    var objectStore = db.createObjectStore(OS_NAME, { keyPath: 'path' });\n    objectStore.createIndex(DIR_IDX, 'dir', { unique: false });\n  };\n\n  req.onsuccess = function (e) {\n    callback(e.target.result);\n  };\n}\n\nfunction initOS(type, callback) {\n  init(function (db) {\n    var trans = db.transaction([OS_NAME], type),\n        os = trans.objectStore(OS_NAME);\n\n    callback(os);\n  });\n}\n\nvar readFile = function (fileName, callback) {\n  initOS('readonly', function (os) {\n    var req = os.get(fileName);\n\n    req.onerror = function (e) {\n      callback(e);\n    };\n\n    req.onsuccess = function (e) {\n      var res = e.target.result;\n\n      if (res && res.data) {\n        callback(null, res.data);\n      } else {\n        callback('File not found');\n      }\n    };\n  });\n};\n\nexports.readFile = function (fileName, callback) {\n  readFile(fileName, function (err, data) {\n    if (!err && !(data instanceof ArrayBuffer)) {\n      data = str2ab(data.toString());\n    }\n    callback(err, data);\n  });\n};\n\nexports.readString = function (fileName, callback) {\n  readFile(fileName, function (err, data) {\n    if (!err && (data instanceof ArrayBuffer)) {\n      data = ab2str(data);\n    }\n    callback(err, data);\n  });\n};\n\nexports.writeFile = function (fileName, data, callback) {\n  initOS('readwrite', function (os) {\n    var req = os.put({\n      \"path\": fileName,\n      \"dir\": path.dirname(fileName),\n      \"type\": \"file\",\n      \"data\": data\n    });\n\n    req.onerror = function (e) {\n      callback(e);\n    };\n\n    req.onsuccess = function (e) {\n      callback(null);\n    };\n  });\n};\n\nexports.removeFile = function (fileName, callback) {\n  initOS('readwrite', function (os) {\n    var req = os.delete(fileName);\n\n    req.onerror = req.onsuccess = function (e) {\n      callback();\n    };\n  });\n};\n\nfunction withTrailingSlash(path) {\n  var directoryWithTrailingSlash = path[path.length - 1] === '/'\n    ? path\n    : path + '/';\n  return directoryWithTrailingSlash;\n}\n\nexports.readdir = function (directoryName, callback) {\n  initOS('readonly', function (os) {\n    var dir = path.dirname(withTrailingSlash(directoryName));\n\n    var idx = os.index(DIR_IDX);\n    var range = IDBKeyRange.only(dir);\n    var req = idx.openCursor(range);\n\n    req.onerror = function (e) {\n      callback(e);\n    };\n\n    var results = [];\n    req.onsuccess = function (e) {\n      var cursor = e.target.result;\n      if (cursor) {\n        var value = cursor.value;\n        var entry = new exports.DirectoryEntry(value.path, value.type);\n        results.push(entry);\n        cursor.continue();\n      } else {\n        callback(null, results);\n      }\n    };\n  });\n};\n\nexports.mkdir = function (fullPath, callback) {\n  initOS('readwrite', function (os) {\n    var dir = withTrailingSlash(path);\n   \n    var req = os.put({\n      \"path\": fullPath,\n      \"dir\": path.dirname(dir),\n      \"type\": \"directory\"\n    });\n\n    req.onerror = function (e) {\n      callback(e);\n    };\n\n    req.onsuccess = function (e) {\n      callback(null);\n    };\n  });\n};\n\nexports.rmdir = function (fullPath, callback) {\n  exports.readdir(fullPath, function removeFiles(files) {\n    if (!files || !files.length) {\n      return exports.removeFile(fullPath, callback);\n    }\n\n    var file = files.shift(),\n        func = file.type === 'directory'\n          ? exports.rmdir\n          : exports.removeFile;\n\n    func(file.name, function () {\n      removeFiles(files);\n    });\n  });\n};//@ sourceURL=fs/indexeddb.js"
));
require.alias("component-path/index.js", "fs/deps/path/index.js");
