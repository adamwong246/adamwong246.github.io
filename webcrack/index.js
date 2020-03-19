#!/usr/bin/env node

http = require('http');
sstatic = require('node-static');

memoUniverse = require('./memo.js');
build = require('./build.js');
develop = require('./develop.js');
server = require('./server.js');

if (process.argv[2] == 'produce') {
  return build({outFolder: './dist', minify: true});
} else if (process.argv[2] == 'develop') {
  develop();
}else if (process.argv[2] == 'preview') {
  build({outFolder: './dist', minify: true});
  server(8080, './dist');
}
