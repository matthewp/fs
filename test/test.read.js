describe('Read', function () {
  var fs = require('fs');

  describe('Reading a file that doesn\'t exist', function () {
    it('Should return an error', function (done) {
      fs.readFile('some-fake-file.txt', function (err, data) {
        done(assert(err !== null));
      });
    });
  });

});