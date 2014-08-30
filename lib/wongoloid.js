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
            ).map(function(e){
              return frontMatter.loadFront(e);
            })
          }
          );
      }

      return z;
    }), require(path_to_underscore_file));
  }

};





// # # Write a file, making dirs as needed.
// # writeFileWithIndifferentWrite = (dest, content) ->
// #   mkdirp dest.split("/").slice(0, -1).join("/"), (err) ->
// #     if err
// #       console.error err
// #     else
// #       fs.writeFile dest, content
// #     return

// #   return

// # # Build content tree from yaml files
// # # add js object literals
// # # execute model tree

// # md_files = (path_to_data_file) ->
// #   glob.sync("./_src/_blog/" + require(path_to_data_file).blogs)

// # md_files2 = (path_to_data_file) ->
// #   md_files(path_to_data_file)

// # build_md = (path_to_data_file) ->
// #   glob.sync(path_to_data_file.split("/").slice(0, -1).concat("**/*.md").join("/")).map((e) ->
// #     (path.relative("./_src/_blog/", e).split("/").reduceRight ((p, c) ->
// #       b = undefined
// #       b = {}
// #       b[c] = p
// #       b
// #     ), merge(frontMatter.loadFront(e), path: e))
// #   )

// # build_js = (path_to_data_file) ->
// #   path.relative(".", path_to_data_file).split("/").reduceRight(((p, c) ->
// #     b = undefined
// #     b = {}
// #     b[c] = p
// #     b
// #   ), require(path_to_data_file))

// # buildContent3 = (path_to_data_file) ->
// #   path.relative(".", path_to_data_file).split("/").reduceRight(((p, c) ->
// #     b = undefined
// #     b = {}
// #     b[c] = p
// #     b
// #   ), require(path_to_data_file))

// # # content = build_md("./_src/_blog/_.js")
// # # content2 = build_js("./_src/_blog/_.js")
// # # content3 = buildContent3("./_src/_blog/_.js")

// # console.log('##############################')
// # eyes.inspect(md_files2("./_src/_blog/_.js"))
// # # eyes.inspect(content3)
