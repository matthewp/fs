describe('Write', function () {
  var fs = require('fs');

  var TEST_FILE = 'write-test.txt';
  before(function (done) {
    fs.writeFile(TEST_FILE, 'Foo bar', function () {
      done();
    });
  });

  function exists(obj) {
    return typeof obj !== 'undefined' && obj !== null;
  }

  describe('Writing data to a file.', function () {
    it('Retrieving that file should have an error.', function (done) {
      fs.readFile(TEST_FILE, function (err, data) {
        done(assert(err === null));
      });
    });

    it('Retrieving should include data.', function (done) {
      fs.readFile(TEST_FILE, function (err, data) {
        done(assert(exists(data)));
      });
    });
  });

});