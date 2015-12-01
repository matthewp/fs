# fs-web

Bringing a file system abstraction to the browser. **fs** is a module that allows you to store data in the (modern) browser using an API similar to that of Node's [fs module](http://nodejs.org/api/fs.html)

Implemented in a cross-browser fashion, using [IndexedDB](http://www.w3.org/TR/IndexedDB/).

## Installation

Install via npm:

```shell
npm install fs-web --save
```

## Example

Writing from a file input.

```javascript
import { writeFile } from 'fs-web';

let input = document.querySelector('input[type="file"]'); 
input.addEventListener('change', function(e) {
  let file = this.files[0]; // file is a File object.

  writeFile(file.name, file).then(function() {
    // All done! File has been saved.
  });
});
```

Writing and reading.

```js
import * as fs from 'fs-web';

fs.writeFile('foo/some-file.txt', 'foo')
  .then(function(){
    return fs.readdir('foo');
  })
  .then(function(files){
    files // -> [ {some-file.txt} ]
  });
```

## API

All methods return a Promise.

### fs.writeFile(fileName, data)

Saves the file ``data`` with the name ``fileName`` and returns a Promise. If an error is encountered, the Promise will be rejected with an ``Error`` object.

### fs.readFile(fileName)

Retrieves the file with the name ``fileName`` and returns a Promise. The Promise will resolve with the file's data as an ``ArrayBuffer``.

### fs.readString(fileName)

Retrieves the file with the name ``fileName`` and returns a Promise. The Promise will resolve with a string representation of `fileName`.

### fs.removeFile(fileName)

Removes the file with the name ``fileName`` from storage and returns a Promise. The Promise will resolve even if the fileName doesn't exist.

### fs.readdir(fullPath)

Gets the contents of ``fullPath`` and returns a Promise. The Promise will resolve with an array of ``DirectoryEntry`` objects (see below).

### fs.mkdir(fullPath)

Creates a directory at ``fullPath`` and returns a Promise.

### fs.rmdir(fullPath)

Removes the directory at ``fullPath``, recursively removing any files/subdirectories contained within. Returns a Promise that will resolve when the fullPath is removed.

### DirectoryEntry

A ``DirectoryEntry`` object is resolved from ``fs.readdir`` and represents either a **file** or a **directory**. A DirectoryEntry instance contains these properties/methods:

### DirectoryEntry#path

The ``path`` property is the full path (including file name) for the given file/directory entry.

### DirectoryEntry#name

The ``name`` of the given entry, either the file or directory name.

### DirectoryEntry#dir

The given directory that the file/directory sits in.

### DirectoryEntry#type

The ``type`` of the entry, either **file** or **directory**.

### DirectoryEntry#readFile()

A convenience method for calling ``readFile(fileName)``. Throws a TypeError if the entry is not of ``type`` **file**.

## License

BSD 2 Clause
