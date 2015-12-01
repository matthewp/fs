import chai from 'chai';
import * as fs from 'fs-web';
import 'steal-mocha';

const { assert } = chai;

describe('Remove', function () {
  var TEST_FILE = 'rem-test.txt';
  before(function (done) {
    fs.writeFile(TEST_FILE, 'Foo bar').then(done);
  });

  function exists(obj) {
    return typeof obj !== 'undefined' && obj !== null;
  }

  describe('Removing a file that exists.', function () {
    it('Should call the callback.', function (done) {
      fs.removeFile(TEST_FILE).then(function() {
        done(assert(true));
      });
    });
  });

  describe('Removing a file that doesn\'t exist.', function () {
    it('Should call the callback.', function(done) {
      fs.removeFile('rem-does-not-exist.txt').then(function() {
        done(assert(true));
      });
    });
  });

});
