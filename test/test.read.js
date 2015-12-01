import chai from 'chai';
import * as fs from 'fs-web';
import 'steal-mocha';

const { assert } = chai;

describe('Read', function () {
  describe('Reading a file that doesn\'t exist', function () {
    it('Should return an error', function (done) {
      fs.readFile('some-fake-file.txt').then(null, function (err) {
        done(assert(err !== null));
      });
    });
  });

  describe('Reading a text file', function () {
    var fileName = 'read-some-file.txt',
        contents = 'Foo bar baz';

    before(function (done) {
      fs.writeFile(fileName, contents).then(done);
    });

    it('readString should return a string', function (done) {
      fs.readString(fileName).then(function(res) {
        done(assert(res === contents));
      });
    });

    it('readFile should return an ArrayBuffer', function (done) {
      fs.readFile(fileName).then(function(res) {
        done(assert(res instanceof ArrayBuffer));
      });
    });
  });

  describe('Reading a binary file', function () {
    function getPicture() {
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

    it('Should return an ArrayBuffer', function (done) {
      var fileName = 'read-picture.jpg';

      getPicture().then(function (ab) {
        return fs.writeFile(fileName, ab);
      }).then(function(){
        return fs.readFile(fileName);
      }).then(function(res){
        done(assert(res instanceof ArrayBuffer));
      });
    });
  });

});
