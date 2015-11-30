import * as fs from 'fs-web';
import chai from 'chai';
import 'steal-mocha';

const { assert } = chai;

describe('Write', function () {
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
    it('Should return null for the error.', function (done) {
      fs.writeFile(TEST_FILE, 'Foo bar', function (err) {
        done(assert(err === null));
      });
    });

    it('Retrieving that file should\'nt have an error.', function (done) {
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


  function getPicture(callback) {
    var req = new XMLHttpRequest();
    req.open('GET', 'picture.jpg', true);
    req.responseType = 'arraybuffer';

    req.onload = function (e) {
      callback(e.target.response);
    };

    req.send();
  }

  describe('Writing binary data to a file.', function () {
    it('Should return without an error.', function (done) {
      getPicture(function (data) {
        fs.writeFile('write-picture.jpg', data, function (err) {
          done(assert(err === null));
        });
      });
    });
  });
});
