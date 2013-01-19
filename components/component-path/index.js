
exports.basename = function(path){
  return path.split('/').pop();
};

exports.dirname = function(path){
  return path.split('/').slice(0, -1).join('/') || '.'; 
};

exports.extname = function(path){
  var base = exports.basename(path);
  if (!~base.indexOf('.')) return '';
  var ext = base.split('.').pop();
  return '.' + ext;
};