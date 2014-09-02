var eyes = require('eyes');

var wongoloid = require("./lib/wongoloid.js");

// var universe = wongoloid.crunch('../_src/_blog/_.js');
// eyes.inspect(universe);
// wongoloid.render(universe.src.blog);

wongoloid.crunch_and_render(
  [
    blogs = {
      input_from: "**/*.md",
      input: function(file){
        return frontMatter.loadFront(file);
      },
      output_to: function(file) {
        if (typeof file.title != "undefined"){
          return "./blog/" + file.title.replace(' ', '-')  + '.html';
        } else {
          return "./blog/" + path.relative('./_src/_blog', file.path).replace('.md', '.html');
        }
        
      },
      output: function(file){
        return beautify_html(
          jade.compileFile('./_src/_views/_layout.jade')(file.content)
        );
      }
    },

    about_me = {
      input_from: "_about.md",
      input: function(file){
        frontMatter.loadFront(file);
      },
      output_to: "about.html",
      output: function(file){
        return beautify_html(
          jade.compileFile('./_src/_views/_layout.jade')(file.content)
        );
      }
    },

    css ={
      input_from: "_assets/**/*.css",
      input: function(file){
        return fs.readSync(file, 'utf8');
      },
      output_to: "main.css",
      output: function(file, context){
        return mergArray(context.items.map(function(e){ e.content })));
      }

    }


  ]
);