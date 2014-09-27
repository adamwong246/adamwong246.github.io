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

        var a = deepMerge(
            {file: fs.readFileSync(file, 'utf8')},
            {path: file}
          );

        return deepMerge(universe.config[chunkKey].input(a), a);
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

  eyes.inspect(universe);

  Object.keys(universe.config).forEach(function(chunkKey){
    universe.config[chunkKey].inputs.forEach(function(input){

      indifferentWriteFile ("./" + input.url, universe.config[chunkKey].output(
        deepMerge(universe, {self: input})
      ));


    });
  });

};

/////////////////

// config = {
//   key: {
//     files: "a file or glob pattern of files to read",
//     input: function(opts){
//       // return a hash which are appended to the objects 'self'
//       // if you do not return a value for key 'url', the value will be provided for you
//       // if you do not return a value for key 'html', the value will be provided for you
//     },
//     output:  function(universe){
//        // create output hash describing how a file should be saved
//     }
//   }
// };

var config = {

  index: {
    files: "./_src/_pages/index.jade",

    input: function(opts){
      return {url: '/index.html'};
    },

    output: function(universe){
      return jade.compileFile(universe.self.path)(universe);
    }
  },

  about_me: {
    files: "./_src/_pages/about_me.md",

    input: function(opts){
      var m = meta_marked(opts.file);

      return {markdown: m, url: '/about_me.html', content: m.html};
    },

    output: function(universe){
      return jade.compileFile('./_src/_views/_layout.jade')(universe);
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

      return {markdown: m, content: m.html, url: filename};
    },

    output: function(universe){
      return jade.compileFile('./_src/_views/_layout.jade')(universe);
    }
  }
};

crunch(config);