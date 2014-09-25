var glob      = require("glob");
var fs        = require('fs');
var path      = require("path");
var deepMerge = require('deepmerge');
var mkdirp    = require("mkdirp");

var meta_marked   = require('meta-marked');
var jade          = require('jade');
var beautify_html = require('js-beautify').html;

var eyes = require('eyes');

//////////

var indifferentWriteFile = function(dest, content) {
  mkdirp(dest.split("/").slice(0, -1).join("/"), function(err) {
    if (err) {
      console.error(err);
    } else {
      fs.writeFile(dest, content);
    }
  });
};

var crunch = function(chunks){

  Object.keys(chunks).forEach(function(chunkKey){
    chunks[chunkKey].inputs = glob.sync(chunks[chunkKey].files).map(
      function(file){
        return chunks[chunkKey].input(
          deepMerge(
            {file: fs.readFileSync(file, 'utf8')},
            {path: file}
          )
        );
      }
    );
  });

  eyes.inspect(chunks);

  Object.keys(chunks).forEach(function(chunkKey){
    chunks[chunkKey].inputs.forEach(function(input){
      chunks[chunkKey].output(input, chunks);
    });
  });

};

/////////////////

var config = {

  index: {
    files: "./_src/_pages/index.jade",

    input: function(opts){
      opts.final_filename = '/index.html';
      return opts;
    },

    output: function(inputHash, universe){
      inputHash.html = jade.compileFile(inputHash.path)({local: inputHash, global: universe});
      indifferentWriteFile("./" + inputHash.final_filename, beautify_html(
        jade.compileFile('./_src/_views/_layout.jade')({local: inputHash, global: universe})
      ));
    }
  },

  about_me: {
    files: "./_src/_pages/about_me.md",

    input: function(opts){
      // return meta_marked(opts.file);
      var m = meta_marked(opts.file);
      return deepMerge(m, {final_filename: '/about_me.html'});
    },

    output: function(inputHash, universe){
      indifferentWriteFile("./" + inputHash.final_filename, beautify_html(
        jade.compileFile('./_src/_views/_layout.jade')({local: inputHash, global: universe})
      ));
    }
  },

  blogs: {
    files: "./_src/_blog/*/*.md",

    input: function(opts){
      var m = meta_marked(opts.file);
      var filename = '';

      if (typeof m.meta.title != "undefined"){
        filename = "/blog/" + m.meta.title.replace(' ', '-')  + '.html';
      } else {
        filename = "/blog/" + path.relative('./_src/_blog', opts.path).replace('.md', '.html');
      }

      if (typeof m.meta.title === "undefined"){
        m.meta.title = filename;
      }

      return deepMerge(m, {final_filename: filename});
    },

    output: function(inputHash, universe){

      indifferentWriteFile("./" + inputHash.final_filename, beautify_html(
        jade.compileFile('./_src/_views/_layout.jade')({local: inputHash, global: universe})
      ));
    }
  }
};

crunch(config);