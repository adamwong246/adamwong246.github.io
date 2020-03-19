var CleanCSS = require('clean-css');

readFiles = require('read-files-promise');
fs_extra = require('fs-extra');
lwip = require('js-lwip');

jadeWrite = require('./jadeWrite.js');

module.exports = function(options) {
  var outFile, profilePicOutfile;
  jadeWrite(options.outFolder + "/index.html", "./src/index.jade", {}, {
    minify: options.minify
  });
  jadeWrite(options.outFolder + "/blog.html", "./src/blog.jade", {}, {
    minify: options.minify
  });
  _.each(memoUniverse().blogEntries, function(blogEntry) {
    return jadeWrite("" + options.outFolder + blogEntry.dest, './src/blogEntryLayout.jade', {
      entry: blogEntry
    }, {
      minify: options.minify
    });
  });
  _.each(memoUniverse().pages, function(page) {
    return jadeWrite("" + options.outFolder + page.dest, "./src/page.jade", {
      page: page
    }, {
      minify: options.minify
    });
  });
  jadeWrite(options.outFolder + "/README.html", "./src/page.jade", {
    page: mm.parseFileSync("./README.md")
  }, {
    minify: options.minify
  });
  outFile = options.outFolder + "/style.css";
  readFiles(['./node_modules/normalize.css/normalize.css', './src/style.css'], {
    encoding: 'utf8'
  }).then(function(buffers) {
    return buffers.join(' \n ');
  }).then(function(joined) {
    return fs.writeFile(outFile, new CleanCSS({
      keepSpecialComments: 0
    }).minify(joined).styles, function(err) {
      if (err) {
        return console.error(err);
      } else {
        return console.log("---> " + outFile);
      }
    });
  });
  _.each(memoUniverse().blogEntries, function(blogEntry) {
    return _.each(blogEntry.assets.jpgs, function(srcPath) {
      var optDest, origDest;
      optDest = "" + options.outFolder + blogEntry.url + "/" + (path.basename(srcPath));
      lwip.open(srcPath, function(err, image) {
        return image.batch().scale(0.2).writeFile(optDest, 'jpg', {
          quality: 50
        }, function(err) {
          if (err) {
            return console.error(err);
          } else {
            return console.log("---> " + optDest);
          }
        });
      });
      origDest = "" + options.outFolder + blogEntry.url + "/orig-" +(path.basename(srcPath));
      return fs_extra.copy(srcPath, origDest, function(err) {
        if (err) {
          return console.error(err);
        } else {
          return console.log("---> " + origDest);
        }
      });
    });
  });
  profilePicOutfile = options.outFolder + "/evilShroom.png";
  return fs_extra.copy("src/evilShroom.png", profilePicOutfile, function(err) {
    if (err) {
      return console.error(err);
    } else {
      return console.log("---> " + profilePicOutfile);
    }
  });
};
