http = require('http');
watch = require('watch');
sstatic = require('node-static');

build = require('./build.js');
server = require('./server.js');

const clearAndWrite = (memo, outFolder) => {
  memo.clear();
  return build(memo, {
    outFolder: outFolder,
    minify: false
  });
};

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
      clearAndWrite(memo, outFolder)
    });
    monitor.on('changed', function(f, curr, prev) {
      clearAndWrite(memo, outFolder)
    });
    monitor.on('removed', function(f, stat) {
      clearAndWrite(memo, outFolder)
    });
  });
}
