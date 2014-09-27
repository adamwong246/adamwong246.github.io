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

  var universe = {config: chunks};

  Object.keys(universe.config).forEach(function(chunkKey){
    universe.config[chunkKey].inputs = glob.sync(universe.config[chunkKey].files).map(
      function(file){
        return universe.config[chunkKey].input(
          deepMerge(
            {file: fs.readFileSync(file, 'utf8')},
            {path: file}
          )
        );
      }
    );

    universe[chunkKey] = function(){
      if (universe.config[chunkKey].inputs.length > 1){
        return universe.config[chunkKey].inputs;
      } else {
        return universe.config[chunkKey].inputs[0];
      }
    };

  });

  Object.keys(universe.config).forEach(function(chunkKey){
    universe.config[chunkKey].inputs.forEach(function(input){
      universe.config[chunkKey].output(
        deepMerge(universe, {self: input})
      );
    });
  });

};

/////////////////

var config = {

  index: {
    files: "./_src/_pages/index.jade",

    input: function(opts){
      opts.url = '/index.html';
      return opts;
    },

    output: function(universe){
      universe.self.html = jade.compileFile(universe.self.path)(universe);
      indifferentWriteFile("./" + universe.self.url, beautify_html(
        jade.compileFile('./_src/_views/_layout.jade')(universe)
      ));
    }
  },

  about_me: {
    files: "./_src/_pages/about_me.md",

    input: function(opts){
      return deepMerge(meta_marked(opts.file), {url: '/about_me.html'});
    },

    output: function(universe){
      indifferentWriteFile("./" + universe.self.url, beautify_html(
        jade.compileFile('./_src/_views/_layout.jade')(universe)
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

      return deepMerge(m, {url: filename});
    },

    output: function(universe){

      indifferentWriteFile("./" + universe.self.url, beautify_html(
        jade.compileFile('./_src/_views/_layout.jade')(universe)
      ));
    }
  }
};

crunch(config);