http = require('http');
watch = require('watch');
sstatic = require('node-static');

build = require('./build.js');

const clearAndWrite = (memoUniverse, outFolder) => {
  memoUniverse.clear();
  return build({
    outFolder: outFolder,
    minify: false
  });
};

module.exports = function () {
  var outFolder;
  outFolder = './tmp';
  fs_extra.removeSync(outFolder);
  build({
    outFolder: outFolder,
    minify: false
  });
  http.createServer(function(req, res) {
    return new sstatic.Server(outFolder).serve(req, res);
  }).listen(8080);
  console.log('server now running on port 8080...');
  return watch.createMonitor('./src', function(monitor) {
    monitor.files['./**/*'];
    monitor.on('created', function(f, stat) {
      clearAndWrite(memoUniverse, outFolder)
    });
    monitor.on('changed', function(f, curr, prev) {
      clearAndWrite(memoUniverse, outFolder)
    });
    monitor.on('removed', function(f, stat) {
      clearAndWrite(memoUniverse, outFolder)
    });
  });
}
