_ = require("lodash");
glob = require('glob');
path = require('path');
fs_extra = require('fs-extra');

var maxPlusOne, newFile;
maxPlusOne = Math.max.apply(null, _.map(glob.sync('src/blogEntries/*/'), function(page) {
  return parseInt(path.basename(page, '.md')) || 0;
})) + 1;
newFile = "./src/blogEntries/" + maxPlusOne + "/index.md";
return fs_extra.outputFile(newFile, "---\ntitle: CHANGE ME\npublishedAt: " + (new Date().toString()) + "\n---", function(err) {
  if (err) {
    return console.error(err);
  } else {
    return console.log(newFile);
  }
});