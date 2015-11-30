/*fs-web@0.8.0#core*/
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.readFile = readFile;
exports.readString = readString;
exports.writeFile = writeFile;
exports.removeFile = removeFile;
exports.readdir = readdir;
exports.mkdir = mkdir;
exports.rmdir = rmdir;
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { 'default': obj };
}
var _path = require('path');
var _path2 = _interopRequireDefault(_path);
var _directory_entry = require('./directory_entry.js');
var _directory_entry2 = _interopRequireDefault(_directory_entry);
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2);
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
var DB_NAME = window.location.host + '_filesystem', OS_NAME = 'files', DIR_IDX = 'dir';
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
        var trans = db.transaction([OS_NAME], type), os = trans.objectStore(OS_NAME);
        callback(os);
    });
}
var readFrom = function readFrom(fileName, callback) {
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
function readFile(fileName, callback) {
    readFrom(fileName, function (err, data) {
        if (!err && !(data instanceof ArrayBuffer)) {
            data = str2ab(data.toString());
        }
        callback(err, data);
    });
}
function readString(fileName, callback) {
    readFrom(fileName, function (err, data) {
        if (!err && data instanceof ArrayBuffer) {
            data = ab2str(data);
        }
        callback(err, data);
    });
}
;
function writeFile(fileName, data, callback) {
    initOS('readwrite', function (os) {
        var req = os.put({
            'path': fileName,
            'dir': _path2['default'].dirname(fileName),
            'type': 'file',
            'data': data
        });
        req.onerror = function (e) {
            callback(e);
        };
        req.onsuccess = function (e) {
            callback(null);
        };
    });
}
;
function removeFile(fileName, callback) {
    initOS('readwrite', function (os) {
        var req = os['delete'](fileName);
        req.onerror = req.onsuccess = function (e) {
            callback();
        };
    });
}
;
function withTrailingSlash(path) {
    var directoryWithTrailingSlash = path[path.length - 1] === '/' ? path : path + '/';
    return directoryWithTrailingSlash;
}
function readdir(directoryName, callback) {
    initOS('readonly', function (os) {
        var dir = _path2['default'].dirname(withTrailingSlash(directoryName));
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
                var entry = new _directory_entry2['default'](value.path, value.type);
                results.push(entry);
                cursor['continue']();
            } else {
                callback(null, results);
            }
        };
    });
}
;
function mkdir(fullPath, callback) {
    initOS('readwrite', function (os) {
        var dir = withTrailingSlash(_path2['default']);
        var req = os.put({
            'path': fullPath,
            'dir': _path2['default'].dirname(dir),
            'type': 'directory'
        });
        req.onerror = function (e) {
            callback(e);
        };
        req.onsuccess = function (e) {
            callback(null);
        };
    });
}
;
function rmdir(fullPath, callback) {
    readdir(fullPath, function removeFiles(files) {
        if (!files || !files.length) {
            return removeFile(fullPath, callback);
        }
        var file = files.shift(), func = file.type === 'directory' ? rmdir : removeFile;
        func(file.name, function () {
            removeFiles(files);
        });
    });
}
;