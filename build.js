var wongoloid = require("./wongoloid.js");

var path      = require("path");
var meta_marked   = require('meta-marked');
var jade          = require('jade');

var eyes = require('eyes');

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
    input: function(opts){ return {url: '/index.html'}; },
    output: function(universe){ return jade.compileFile(universe.self.path)(universe); }
  },

  about_me: {
    files: "./_src/_pages/about_me.md",

    input: function(opts){
      var m = meta_marked(opts.file);
      return {markdown: m, url: '/about_me.html', content: m.html};
    },

    output: function(universe){return jade.compileFile('./_src/_views/_layout.jade')(universe);}
  },

  blogs: {
    files: "./_src/_blog/*/*.md",

    input: function(opts){
      var m = meta_marked(opts.file);
      var url = '';

      if (typeof m.meta.title != "undefined"){
        url = "/blog/" + m.meta.title.replace(' ', '-')  + '.html';
      } else {
        url = "/blog/" + path.relative('./_src/_blog', opts.path).replace('.md', '.html');
      }

      if (typeof m.meta.title === "undefined"){
        m.meta.title = url;
      }

      return {markdown: m, content : m.html, url: url};
    },

    output: function(universe){ return jade.compileFile('./_src/_views/_layout.jade')(universe); }
  },

  css:{
    files: ["./_src/_assets/bower_components/normalize.css/*.css", "./_src/_assets/_css/*.css"],
    input_all: function(files){ return {url: '/main.css'}; },
    output_all: function(universe){ return universe.self.inputs.map(function(input){ return input.file; }).join("\n");}
  }
};

wongoloid.crunch(config);