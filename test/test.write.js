import * as fs from 'fs-web';
import chai from 'chai';
import 'steal-mocha';

const { assert } = chai;

describe('Write', function () {
  var TEST_FILE = 'write-test.txt';
  before(function (done) {
    fs.writeFile(TEST_FILE, 'Foo bar').then(done);
  });

  function exists(obj) {
    return typeof obj !== 'undefined' && obj !== null;
  }

  describe('Writing data to a file.', function () {
    it('Should not have an error.', function (done) {
      fs.writeFile(TEST_FILE, 'Foo bar').then(function () {
        done(assert(true));
      });
    });

    it('Retrieving that file should\'nt have an error.', function (done) {
      fs.readFile(TEST_FILE).then(function (data) {
        done(assert(true));
      });
    });

    it('Retrieving should include data.', function (done) {
      fs.readFile(TEST_FILE).then(function(data) {
        done(assert(exists(data)));
      });
    });
  });


  function getPicture(callback) {
    var req = new XMLHttpRequest();
    req.open('GET', 'picture.jpg', true);
    req.responseType = 'arraybuffer';

    return new Promise(function(resolve){
      req.onload = function (e) {
        resolve(e.target.response);
      };

      req.send();
    });
  }

  describe('Writing binary data to a file.', function () {
    it('Should return without an error.', function (done) {
      getPicture().then(function (data) {
        fs.writeFile('write-picture.jpg', data).then(function () {
          done(assert(true));
        });
      });
    });
  });
});
