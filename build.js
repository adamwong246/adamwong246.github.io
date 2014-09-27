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

      return {markdown: m, content : m.html, url: filename};
    },

    output: function(universe){
      return jade.compileFile('./_src/_views/_layout.jade')(universe);
    }
  }
};

wongoloid.crunch(config);