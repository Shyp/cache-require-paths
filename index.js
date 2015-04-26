var SAVE_FILENAME = './.cache-require-paths.json';
var Module = require('module');
var fs = require('fs');
var exists = fs.existsSync;

var _require = Module.prototype.require;
var nameCache = exists(SAVE_FILENAME) ? JSON.parse(fs.readFileSync(SAVE_FILENAME, 'utf-8')) : {};

var isFilesystemImport = function(path) {
  return path.indexOf('./') === 0|| path.indexOf('../') === 0 || path.indexOf('/') === 0;
};

Module.prototype.require = function cachePathsRequire(name) {

  var pathToLoad;

  var currentModuleCache = nameCache[this.filename];
  if (!currentModuleCache) {
    currentModuleCache = {};
    nameCache[this.filename] = currentModuleCache;
  }
  if (currentModuleCache[name]) {
    pathToLoad = currentModuleCache[name];
  } else if (!isFilesystemImport(name)) {
    pathToLoad = Module._resolveFilename(name, this);
    currentModuleCache[name] = pathToLoad;
  } else {
    pathToLoad = name;
  }

  return _require.call(this, pathToLoad);
};

function printCache() {
  Object.keys(nameCache).forEach(function (fromFilename) {
    console.log(fromFilename);
    var moduleCache = nameCache[fromFilename];
    Object.keys(moduleCache).forEach(function (name) {
      console.log(' ', name, '->', moduleCache[name]);
    });
  });
}

process.once('exit', function () {
  fs.writeFileSync(SAVE_FILENAME,
    JSON.stringify(nameCache, null, 2), 'utf-8');
});
