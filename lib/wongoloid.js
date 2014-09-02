var beautify_html, deepMerge, dir, eyes, foo, frontMatter, fs, glob, markdown, merge, mkdirp, path, util;

fs = require("fs");
dir = require("node-dir");
path = require("path");
frontMatter = require("yaml-front-matter");
markdown = require("markdown").markdown;
merge = require('merge');
deepMerge = require('deepmerge');
beautify_html = require("js-beautify").html;
mkdirp = require("mkdirp");
glob = require("glob");
util = require("util");
eyes = require('eyes');


var writeFileWithIndifferentWrite = function(dest, content) {
  mkdirp(dest.split("/").slice(0, -1).join("/"), function(err) {
    if (err) {
      console.error(err);
    } else {
      fs.writeFile(dest, content);
    }
  });
};


module.exports = {

  crunch: function(path_to_underscore_file) {
    return path.relative("../.", path_to_underscore_file).split("/").reduceRight((function(p, c, i, a) {
      var b;
      b = void 0;
      b = {};
      b[c.replace(/^_/, '')] = p;

      var z = b;

      if (i == a.length - 1) {
        z = deepMerge(
          b, {
            files: glob.sync(
              "./_src/_blog/" + require(path_to_underscore_file).filer
            ).map(function(input_file){
              return deepMerge(frontMatter.loadFront(input_file), {path:input_file});
            })
          }
          );
      }



      return z;
    }), require(path_to_underscore_file));
  },

  render: function(underscore){
    // eyes.inspect(underscore);
    underscore.files.forEach(function(file){
      eyes.inspect(file);
      eyes.inspect(underscore['.js'].route_to(file));

      writeFileWithIndifferentWrite(
        underscore['.js'].route_to(file),
        underscore['.js'].process_content(file)
      );

    });
  }

};
