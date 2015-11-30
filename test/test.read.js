import chai from 'chai';
import * as fs from 'fs-web';
import 'steal-mocha';

const { assert } = chai;

describe('Read', function () {
  describe('Reading a file that doesn\'t exist', function () {
    it('Should return an error', function (done) {
      fs.readFile('some-fake-file.txt', function (err, data) {
        done(assert(err !== null));
      });
    });
  });

  describe('Reading a text file', function () {
    var fileName = 'read-some-file.txt',
        contents = 'Foo bar baz';

    before(function (done) {
      fs.writeFile(fileName, contents, done);
    });

    it('readString should return a string', function (done) {
      fs.readString(fileName, function (err, res) {
        done(assert(res === contents));
      });
    });

    it('readFile should return an ArrayBuffer', function (done) {
      fs.readFile(fileName, function (err, res) {
        done(assert(res instanceof ArrayBuffer));
      });
    });
  });

  describe('Reading a binary file', function () {
    function getPicture(callback) {
      var req = new XMLHttpRequest();
      req.open('GET', 'picture.jpg', true);
      req.responseType = 'arraybuffer';

      req.onload = function (e) {
        callback(e.target.response);
      };

      req.send();
    }

    it('Should return an ArrayBuffer', function (done) {
      var fileName = 'read-picture.jpg';

      getPicture(function (ab) {
        fs.writeFile(fileName, ab, function () {
          fs.readFile(fileName, function (err, res) {
            done(assert(res instanceof ArrayBuffer));
          });
        });
      });
    });
  });

});
