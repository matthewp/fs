module.exports = (window.requestFileSystem || window.webkitRequestFileSystem)
  ? require('./filesystem')
  : require('./indexeddb');