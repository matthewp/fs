var stealExport = require("steal-tools").export;

var denpm = function(name){
  var pkgName = name.substr(0, name.indexOf("@"));
  var modulePath = name.substr(name.indexOf("#")+1);
  return pkgName + "/" + modulePath;
};

stealExport({
  system: {
    config: __dirname + "/package.json!npm",
    main: ["fs-web"]
  },
  outputs: {
    "global": {
      modules: ["fs-web"],
      ignore: false,
      dest: __dirname + "/dist/fs.js",
      transpile: "global",
      normalize: denpm
    },
    "global minified": {
      modules: ["fs-web"],
      ignore: false,
      minify: true,
      dest: __dirname + "/dist/fs.min.js",
      transpile: "global",
      normalize: denpm
    },
    "+cjs": {}
  }
});
