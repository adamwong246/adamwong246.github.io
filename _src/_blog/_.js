var beautify_html = require('js-beautify').html;
var fs            = require('fs');
var glob          = require("glob");
var jade          = require('jade');
var markdown      = require("markdown").markdown;
var path          = require('path');
var eyes          = require('eyes');

module.exports = {

  inputs: "**/*.md",

  pre_process: function(file){
    frontMatter.loadFront(file);
  },

  outputs: function(file) {
    if (typeof file.title != "undefined"){
      return "./blog/" + file.title.replace(' ', '-')  + '.html';
    } else {
      return "./blog/" + path.relative('./_src/_blog', file.path).replace('.md', '.html');
    }
    
  },

  post_process: function(file){
    return beautify_html(
      jade.compileFile('./_src/_views/_layout.jade')(file)
    );
  }

};
