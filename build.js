var stealExport = require("steal-tools").export;

var denpm = function(name){
  if(name.indexOf("@") > 0) {
    var pkgName = name.substr(0, name.indexOf("@"));
    var modulePath = name.substr(name.indexOf("#")+1);
    return pkgName + "/" + modulePath;
  }
  return name;
};

stealExport({
  system: {
    config: __dirname + "/package.json!npm",
    main: ["fs-web", "fs-web/global"]
  },
  outputs: {
    "global": {
      modules: ["fs-web/global"],
      ignore: false,
      dest: __dirname + "/dist/fs.js",
      transpile: "global",
      normalize: denpm
    },
    "global minified": {
      modules: ["fs-web/global"],
      ignore: false,
      minify: true,
      dest: __dirname + "/dist/fs.min.js",
      transpile: "global",
      normalize: denpm
    },
    "+cjs": {}
  }
});
