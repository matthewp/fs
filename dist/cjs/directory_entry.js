/*fs-web@1.0.0#directory_entry*/
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { 'default': obj };
}
var _path = require('path');
var _path2 = _interopRequireDefault(_path);
function DirectoryEntry(fullPath, type) {
    this.path = fullPath;
    this.name = _path2['default'].basename(fullPath);
    this.dir = _path2['default'].dirname(fullPath);
    this.type = type;
}
exports['default'] = DirectoryEntry;
module.exports = exports['default'];