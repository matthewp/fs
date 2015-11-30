# fs-web

Bringing a file system abstraction to the browser. **fs** is a [component](https://github.com/component/component) that allows you to store data in the (modern) browser using an API similar to that of Node's [fs module](http://nodejs.org/api/fs.html)

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

  writeFile(file.name, file, function() {
    // All done! File has been saved.
  });
});
```

Writing and reading.

```js
import * as fs from 'fs-web';

fs.writeFile('foo/some-file.txt', 'foo', function(){
  fs.readdir('foo', function(err, files){
    files // -> [ {some-file.txt} ]
  });
});
```

## API

### fs.writeFile(fileName, data, callback)

Saves the file ``data`` with the name ``fileName`` and calls the ``callback``. If an error is encountered, the first parameter the callback receives will be an ``Error`` object.

### fs.readFile(fileName, callback)

Retrieves the file with the name ``fileName`` and calls the ``callback``. The first parameter of the callback is an ``Error`` object or null, the second parameter is the file's data as an ``ArrayBuffer``.

### fs.readString(fileName, callback)

Retrieves the file with the name ``fileName`` and calls the `callback`. The first parameter of the callback is an ``Error`` or null, the second parameter is a string.

### fs.removeFile(fileName, callback)

Removes the file with the name ``fileName`` from storage and calls the ``callback``. The callback is called even if the file doesn't exist.

### fs.readdir(fullPath, callback)

Gets the contents of ``fullPath`` and calls the ``callback``. The callback will contain an array of ``DirectoryEntry`` objects (see below).

### fs.mkdir(fullPath, callback)

Creates a directory at ``fullPath`` and calls the ``callback``. The only parameter of the callback is an ``Error``, when applicable.

### fs.rmdir(fullPath, callback)

Removes the directory at ``fullPath``, recursively removing any files/subdirectories contained within.

### DirectoryEntry

A ``DirectoryEntry`` object is passed to the callback of ``fs.readdir`` and represents either a **file** or a **directory**. A DirectoryEntry instance contains these properties/methods:

### DirectoryEntry#path

The ``path`` property is the full path (including file name) for the given file/directory entry.

### DirectoryEntry#name

The ``name`` of the given entry, either the file or directory name.

### DirectoryEntry#dir

The given directory that the file/directory sits in.

### DirectoryEntry#type

The ``type`` of the entry, either **file** or **directory**.

### DirectoryEntry#readFile(callback)

A convenience method for calling ``readFile(fileName, callback)``. Throws a TypeError if the entry is not of ``type`` **file**.

## License

BSD 2 Clause
