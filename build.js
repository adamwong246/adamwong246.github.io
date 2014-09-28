var wongoloid = require("./wongoloid.js");

var path          = require("path");
var meta_marked   = require('meta-marked');
var jade          = require('jade');
var markdownpdf   = require("markdown-pdf");

var eyes = require('eyes');

var config = {

  index: {
    files: "./_src/_pages/index.jade",
    input_each: function(opts){ return {url: 'index.html'}; },
    output_each: function(universe, callback){ callback( jade.compileFile(universe.self.path)(universe)); }
  },

  about_me: {
    files: "./_src/_pages/about_me.md",

    input_each: function(member){
      var m = meta_marked(member.file);
      return {markdown: m, url: '/about_me.html', content: m.html};
    },

    output_each: function(universe, callback){callback( jade.compileFile('./_src/_views/_layout.jade')(universe));}
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

    output_each: function(universe, callback){ callback(jade.compileFile('./_src/_views/_layout.jade')(universe)); }
  },

  resume_html: {
    files: "_src/_pages/resume.md",

    input_each: function(member){
      return {content : meta_marked(member.file).html, url: '/resumes/resume.html'};
    },

    output_each: function(universe, callback){
      callback(jade.compileFile('./_src/_views/_layout.jade')(universe));
    }
  },

  resume_md: {
    files: "_src/_pages/resume.md",

    input_each: function(member){
      return {url: '/resumes/resume.md'};
    },

    output_each: function(universe, callback){
      callback( universe.self.file );
    }
  },

  resume_pdf: {
    files: "_src/_pages/resume.md",

    input_each: function(member){
     return {url: '/resumes/resume.pdf'};
    },

    output_each: function(universe, callback){
      markdownpdf().from(universe.self.path).to(universe.self.url);
    }
  },

  css:{
    files: ["./_src/_assets/bower_components/normalize.css/*.css", "./_src/_assets/_css/*.css"],
    input_all: function(collection){ return {url: '/main.css'}; },
    output_all: function(universe, callback){
      callback ( universe.self.inputs.map(function(input){ return input.file; }).join("\n") );
    }
  }
};

wongoloid.crunch(config);