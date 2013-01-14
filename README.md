# fs

Bringing a file system abstraction to the browser. **fs** is a [component](https://github.com/component/component) that allows you to store data in the (modern) browser using an API similar to that of Node's [fs module](http://nodejs.org/api/fs.html)

Implemented in a cross-browser fashion, using the [FileSystem API](http://www.w3.org/TR/file-system-api/) (for Chrome) or [IndexedDB](http://www.w3.org/TR/IndexedDB/) (for Firefox/IE).

## Installation

    $ component install matthewp/fs

## Example

    var fs = require('fs');

	document.querySelector('input[type="file"]').addEventListener('change', function(e) {
      var file = this.files[0]; // file is a File object.

	  fs.writeFile(file.name, file, function() {
	    // All done! File has been saved.
	  });
	});

## API

### fs.writeFile(fileName, data, callback)

Saves the file ``data`` with the name ``fileName`` and calls the ``callback``. If an error is encountered, the first parameter the callback receives will be an ``Error`` object.

### fs.readFile(fileName, callback)

Retrieves the file with the name ``fileName`` and calls the ``callback``. The first parameter of the callback is an ``Error`` object or null, the second parameter is the file's data.

### fs.removeFile(fileName, callback)

Removes the file with the name ``fileName`` from storage and calls the ``callback``. The callback is called even if the file doesn't exist.

## IN PROGRESS

This component is still in very early stages, but plans are to include methods such as:

* readString - Get a file and return it as a string.
* readJson - Get a file and return it as an object.
* readDir - List the contents of a directory.