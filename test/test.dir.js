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

describe('Directory with files', function () {
  var fs = require('fs');

  var err, files;
  before(function (done) {
    fs.writeFile('./foo/dir-file-one.txt', 'Foo', function () {
      fs.writeFile('./foo/dir-file-two.txt', 'bar', function () {
        fs.readdir('foo/', function (e, f) {
          err = e;
          files = f;
          done();
        });
      });
    });
  });

  describe('Listing a directory.', function () {
    it('The error should be null', function () {
      assert(err === null);
    });

    it('Should have an array for the files', function () {
      assert(Array.isArray(files));
    });

    it('Should have 2 files in the directory.', function () {
      assert(files.length === 2);
    });
  });

});