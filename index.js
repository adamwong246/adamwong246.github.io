#!/usr/bin/env node

var CleanCSS, _, build, fs, fs_extra, glob, http, jade, jadeWrite, lwip, memoUniverse, memoize, minify, mkdirp, mm, path, readFiles, slug, sstatic, watch, commander;

_ = require("lodash");
readFiles = require('read-files-promise');
fs = require("fs");
fs_extra = require('fs-extra');
glob = require("glob");
http = require('http');
jade = require("jade");
memoize = require('memoizee');
mm = require("marky-mark");
path = require('path');
slug = require("slug");
sstatic = require('node-static');
watch = require('watch');
minify = require('html-minifier').minify;
mkdirp = require('mkdirp');
lwip = require('lwip');
CleanCSS = require('clean-css');

memoUniverse = memoize(function() {
  var moment;
  return {
    "blogEntries": _.chain(_.map(glob.sync("_src/blogEntries/*"), function(page) {
      var m;
      m = mm.parseFileSync(page + "/index.md");
      m.url = "/blog/" + (path.basename(page)) + "-" + (slug(m.meta.title));
      m.dest = m.url + "/index.html";
      m.src = page;
      m.assets = {
        "jpgs": glob.sync(m.src + "/*.jpg")
      };
      _.each(m.assets.jpgs, function(jpg) {
        return m.content = m.content.replace(path.basename(jpg), m.url + "/" + path.basename(jpg));
      });
      return m;
    })).sortBy(function(n) {
      return new Date(n.meta.publishedAt);
    }).select(function(n) {
      return n.meta.publish !== false;
    }).value().reverse(),
    "pages": _.union(_.chain(glob.sync("_src/pages/**/*.jade")).map(function(jadeFile) {
      var page;
      page = {};
      page.content = jade.renderFile(jadeFile);
      page.url = "/" + (jadeFile.replace('_src/pages/', '').replace(/\.[^\/.]+$/, ''));
      page.dest = page.url + "/index.html";
      page.src = jadeFile;
      return page;
    }).value(), _.chain(glob.sync("_src/pages/**/*.md")).map(function(markdownFile) {
      var m;
      m = mm.parseFileSync(markdownFile);
      m.url = "/" + (markdownFile.replace('_src/pages/', '').replace(/\.[^\/.]+$/, ''));
      m.dest = m.url + "/index.html";
      m.src = markdownFile;
      m.assets = {
        "jpgs": glob.sync(m.src + "/*.jpg")
      };
      _.each(m.assets.jpgs, function(jpg) {
        return m.content = m.content.replace(path.basename(jpg), m.url + "/" + path.basename(jpg));
      });
      return m;
    }).select(function(n) {
      return n.meta.publish !== false;
    }).value()),
    "package": require("./package.json"),
    "moment": moment = require("moment")
  };
});

jadeWrite = function(out, template, locals, options) {
  return mkdirp(path.dirname(out), function(err) {
    var output;
    if (err) {
      return console.log(err);
    } else {
      if (options.minify) {
        output = minify(jade.renderFile(template, _.merge(memoUniverse(), locals)), {
          removeAttributeQuotes: true,
          removeComments: true,
          removeTagWhitespace: true,
          collapseWhitespace: true,
          minifyJS: true
        });
      } else {
        output = jade.renderFile(template, _.merge({
          pretty: true
        }, memoUniverse(), locals));
      }
      return fs.writeFile(out, output, function(err) {
        if (err) {
          return console.error(err);
        } else {
          return console.log("---> " + out);
        }
      });
    }
  });
};

build = function(options) {
  var outFile, profilePicOutfile;
  jadeWrite(options.outFolder + "/index.html", "./_src/index.jade", {}, {
    minify: options.minify
  });
  jadeWrite(options.outFolder + "/blog.html", "./_src/blog.jade", {}, {
    minify: options.minify
  });
  _.each(memoUniverse().blogEntries, function(blogEntry) {
    return jadeWrite("" + options.outFolder + blogEntry.dest, './_src/blogEntryLayout.jade', {
      entry: blogEntry
    }, {
      minify: options.minify
    });
  });
  _.each(memoUniverse().pages, function(page) {
    return jadeWrite("" + options.outFolder + page.dest, "./_src/page.jade", {
      page: page
    }, {
      minify: options.minify
    });
  });
  jadeWrite(options.outFolder + "/README.html", "./_src/page.jade", {
    page: mm.parseFileSync("./README.md")
  }, {
    minify: options.minify
  });
  outFile = options.outFolder + "/style.css";
  readFiles(['./node_modules/normalize.css/normalize.css', './_src/style.css'], {
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
      origDest = "" + options.outFolder + blogEntry.url + "/orig-" + (path.basename(srcPath));
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
  return fs_extra.copy("_src/evilShroom.png", profilePicOutfile, function(err) {
    if (err) {
      return console.error(err);
    } else {
      return console.log("---> " + profilePicOutfile);
    }
  });
};

if (process.argv[2] == 'produce') {
  return build({outFolder: '.', minify: true});

} else if (process.argv[2] == 'develop') {
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
  return watch.createMonitor('./_src', function(monitor) {
    monitor.files['./**/*'];
    monitor.on('created', function(f, stat) {
      memoUniverse.clear();
      return build({
        outFolder: outFolder,
        minify: false
      });
    });
    monitor.on('changed', function(f, curr, prev) {
      memoUniverse.clear();
      return build({
        outFolder: outFolder,
        minify: false
      });
    });
    monitor.on('removed', function(f, stat) {
      memoUniverse.clear();
      return build({
        outFolder: outFolder,
        minify: false
      });
    });
  });
} else if (process.argv[2] == 'newBlogEntry') {
  var maxPlusOne, newFile;
  maxPlusOne = Math.max.apply(null, _.map(glob.sync('_src/blogEntries/*'), function(page) {
    return parseInt(path.basename(page, '.md'));
  })) + 1;
  newFile = "./_src/blogEntries/" + maxPlusOne + "/index.md";
  return fs_extra.outputFile(newFile, "---\ntitle: CHANGE ME\npublishedAt: " + (new Date().toString()) + "\n---", function(err) {
    if (err) {
      return console.error(err);
    } else {
      return console.log(newFile);
    }
  });
}
