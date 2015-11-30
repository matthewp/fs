import chai from 'chai';
import 'steal-mocha';
import {
  DirectoryEntry,
  readdir,
  writeFile,
  mkdir,
  rmdir
} from 'fs-web';

const { assert } = chai;

describe('Empty directory', function () {
  var err, files;
  before(function (done) {
    readdir('dir-not-exist', function (e, f) {
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
  var err, files;
  before(function (done) {
    writeFile('foo/dir-file-one.txt', 'Foo', function () {
      writeFile('foo/dir-file-two.txt', 'bar', function () {
        readdir('foo', function (e, f) {
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

    it('Should contain DirectoryEntry objects', function () {
      assert(files.every(function (item) {
        return item instanceof DirectoryEntry;
      }));
    });

    it('Should have 2 files in the directory.', function () {
      assert(files.length === 2);
    });
  });

});

describe('Root directory', function() {
  describe('Listing contents', function() {
    it('Should be able to list', function(done) {
      readdir('', function() {
        done(assert(true));
      });
    });
  });
});

describe('Manipulating directories', function () {
  describe('Creating a directory.', function () {
    var dirName = 'dir-foobar';

    it('Should not return an error', function (done) {
      mkdir(dirName, function (err) {
        writeFile('dir-remfile1', 'foo bar', function () {
          writeFile('dir-remfile2', 'baz buz', function () {
            done();
          });
        });
      });
    });
  });

  describe('Removing a directory with files.', function () {
    var dirName = 'dir-remme';

    beforeEach(function (done) {
      mkdir(dirName, done);
    });

    it('Should call the callback.', function () {
      rmdir(dirName, assert.bind(null, true));
    });

    it('Should return an empty array for the files', function (done) {
      readdir(dirName, function (err, files) {
        done(assert(!files.length));
      });
    });
  });
});
