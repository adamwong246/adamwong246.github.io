// Generated by CoffeeScript 1.6.3
(function() {
  var beautify_html, dir, fmh_array, frontMatter, fs, glob, js_array, markdown, merge, mkdirp, myMerge, path, util, writeFileWithIndifferentWrite;

  fs = require("fs");

  dir = require("node-dir");

  path = require("path");

  frontMatter = require("yaml-front-matter");

  markdown = require("markdown").markdown;

  merge = require('merge');

  beautify_html = require("js-beautify").html;

  mkdirp = require("mkdirp");

  glob = require("glob");

  util = require("util");

  writeFileWithIndifferentWrite = function(dest, content) {
    mkdirp(dest.split("/").slice(0, -1).join("/"), function(err) {
      if (err) {
        console.error(err);
      } else {
        fs.writeFile(dest, content);
      }
    });
  };

  myMerge = function() {
    console.log(arguments);
    return merge(arguments);
  };

  fmh_array = glob.sync("./_src/_blog/**/*.md").map(function(e) {
    return path.relative("./_src/", e).split("/").reduceRight((function(p, c) {
      var b;
      b = {};
      b[c] = p;
      return b;
    }), merge(frontMatter.loadFront(e), {
      path: e
    }));
  });

  js_array = glob.sync("./_src/_blog/_.js").map(function(e) {
    return path.relative("./_src/", e).split("/").reduceRight((function(p, c) {
      var b;
      b = {};
      b[c] = p;
      return b;
    }), require('./_src/_blog/_.js'));
  });

  console.log(JSON.stringify(js_array));

}).call(this);

/*
//@ sourceMappingURL=build.map
*/