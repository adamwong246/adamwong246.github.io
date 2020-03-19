#!/usr/bin/env node

http = require('http');
sstatic = require('node-static');

memoUniverse = require('./memo.js');
build = require('./build.js');
develop = require('./develop.js');
server = require('./server.js');



if (process.argv[2] == 'produce') {
  return build(memoUniverse(''), {outFolder: './dist', minify: true});
} else if (process.argv[2] == 'develop') {
  develop(memoUniverse(''));
}else if (process.argv[2] == 'preview') {
  build(memoUniverse('https://raw.githubusercontent.com/adamwong246/adamwong246.github.io/master'), {outFolder: './dist', minify: true});
  server(8080, './dist');
}
