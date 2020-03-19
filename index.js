#!/usr/bin/env node

memoUniverse = require('./webcrack/memo.js');
build = require('./webcrack/build.js');
develop = require('./webcrack/develop.js');

if (process.argv[2] == 'produce') {
  return build({outFolder: './dist', minify: true});
} else if (process.argv[2] == 'develop') {
  develop();
} else if (process.argv[2] == 'newBlogEntry') {
  var maxPlusOne, newFile;
  maxPlusOne = Math.max.apply(null, _.map(glob.sync('src/blogEntries/*'), function(page) {
    return parseInt(path.basename(page, '.md'));
  })) + 1;
  newFile = "./src/blogEntries/" + maxPlusOne + "/index.md";
  return fs_extra.outputFile(newFile, "---\ntitle: CHANGE ME\npublishedAt: " + (new Date().toString()) + "\n---", function(err) {
    if (err) {
      return console.error(err);
    } else {
      return console.log(newFile);
    }
  });
}
