var beautify_html = require('js-beautify').html;
var fs            = require('fs');
var glob          = require("glob");
var jade          = require('jade');
var markdown      = require("markdown").markdown;
var path          = require('path');

module.exports = {

  blogs: function(){
    return glob.sync("./_src/_blog/**/*.md");
  },

  route_to: function(o) {

    if (typeof o.title != "undefined"){
      return "./blog/" + o.title.replace(' ', '-')  + '.html';
    } else {
      return "./blog/" + path.relative('./_src/_blog', o.path).replace('.md', '.html');
    }
    
  },

  process_content:  function(o){
    return beautify_html(
      jade.compileFile('./_src/_views/_layout.jade')({'body': markdown.toHTML(
        o['__content']
      ),
      'blogs': this.blogs()})
    );

  }

};
