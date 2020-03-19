http = require('http');
watch = require('watch');
sstatic = require('node-static');

build = require('./build.js');
server = require('./server.js');

// const clearAndWrite = (memoUniverse, outFolder) => {
//   memoUniverse.clear();
//   return build({
//     outFolder: outFolder,
//     minify: false
//   });
// };

module.exports = function (memo) {
  var outFolder;
  outFolder = './tmp';
  fs_extra.removeSync(outFolder);
  build(memo, {
    outFolder: outFolder,
    minify: false
  });
  server(8080, outFolder);
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
