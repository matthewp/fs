describe('Empty directory', function () {
  var fs = require('fs');

  var err, files;
  before(function (done) {
    fs.readdir('dir-not-exist', function (e, f) {
      err = e;
      files = f;
      done();
    });
  });

  describe('Listing an empty directory.', function () {
    it('The error should be null', function (done) {
      done(assert(err === null));
    });

    it('Should have an array for the files', function (done) {
      done(assert(Array.isArray(files)));
    });

    it('Should be an empty array', function (done) {
      done(assert(!files.length));
    });
  });

});