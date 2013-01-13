var fs = null;
function ensureSize(size, then) {
  var rFS = window.requestFileSystem
    || window.webkitRequestFileSystem;

  var pers = window.PERSISTENT;

  window.webkitStorageInfo.requestQuota(pers, size, function(grantedBytes) {
    rFS(pers, grantedBytes, function(fss) {
      fs = fss;
      then(fs);
    });
  });
}

function init(then) {
  if(fs) {
    then(fs); return;
  }

  ensureSize(1024*1024, then);
}

exports.readFile = function(fileName, callback) {
  init(function(fs) {
    fs.root.getFile(fileName, {},
      function onSuccess(fileEntry) {
        fileEntry.file(function(file) {
          var reader = new FileReader();

          reader.onloadend = function(e) {
            callback(null, this.result);
          };

          reader.readAsArrayBuffer(file);
        });
      },
      function onError(err) {
        callback(err);
      });
  });
};

exports.writeFile = function(fileName, data, callback) {
  if(!Array.isArray(data)
    && !(data instanceof File)) {
    if(data instanceof ArrayBuffer) {
      var view = new Uint8Array(data);
      data = new Blob([view]);
    } else {
      data = new Blob([data]);
    }
  }

  ensureSize(data.size, function(fs) {
    fs.root.getFile(fileName, {create: true}, function(fileEntry) {
      fileEntry.createWriter(function(fileWriter) {
        var err = null;
        fileWriter.onwriteend = function(e) {
          callback(err);
        };

        fileWriter.onerror = function(e) {
          err = e.toString();
        };

        fileWriter.write(data);
      });
    }, function onError(err) {
      callback(err);
    });
  });
};

exports.removeFile = function(fileName, callback) {
  init(function(fs) {
    fs.root.getFile(fileName, {create:false}, function(fileEntry) {
      fileEntry.remove(callback);
    }, callback);
  });
};
