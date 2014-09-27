var wongoloid = require("./wongoloid.js");

var path      = require("path");
var meta_marked   = require('meta-marked');
var jade          = require('jade');

var eyes = require('eyes');

var config = {

  index: {
    files: "./_src/_pages/index.jade",
    input_each: function(opts){ return {url: 'index.html'}; },
    output_each: function(universe){ return jade.compileFile(universe.self.path)(universe); }
  },

  about_me: {
    files: "./_src/_pages/about_me.md",

    input_each: function(member){
      var m = meta_marked(member.file);
      return {markdown: m, url: '/about_me.html', content: m.html};
    },

    output_each: function(universe){return jade.compileFile('./_src/_views/_layout.jade')(universe);}
  },

  blogs: {
    files: "./_src/_blog/*/*.md",

    input_each: function(member){
      var m = meta_marked(member.file);
      var url = '';

      if (typeof m.meta.title != "undefined"){
        url = "/blog/" + m.meta.title.replace(' ', '-')  + '.html';
      } else {
        url = "/blog/" + path.relative('./_src/_blog', member.path).replace('.md', '.html');
      }

      if (typeof m.meta.title === "undefined"){
        m.meta.title = url;
      }

      return {markdown: m, content : m.html, url: url};
    },

    output_each: function(universe){ return jade.compileFile('./_src/_views/_layout.jade')(universe); }
  },

  css:{
    files: ["./_src/_assets/bower_components/normalize.css/*.css", "./_src/_assets/_css/*.css"],
    input_all: function(collection){ return {url: '/main.css'}; },
    output_all: function(universe){
      return universe.self.inputs.map(function(input){ return input.file; }).join("\n");
    }
  }
};

wongoloid.crunch(config);