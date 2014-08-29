var fs            = require('fs');
var dir           = require('node-dir');
var path          = require('path');
var frontMatter   = require('yaml-front-matter');
var markdown      = require("markdown").markdown;
var merge         = require('merge');
var beautify_html = require('js-beautify').html;
var mkdirp        = require('mkdirp');
var glob          = require("glob");

// Write a file, making dirs as needed.
var writeFileWithIndifferentWrite = function(dest, content){
  mkdirp(dest.split('/').slice(0, -1).join('/'), function (err) {
    if (err) console.error(err);
    else {
      fs.writeFile(dest, content);
    }
  });
};

function build(a,b,c){
    var o=c.reduceRight(function(o, n){ var b={}; b[n]=o; return b; }, b);
    for(x in a){ o[x]=a[x]; }
    return o;
}

// Build content tree from yaml files
// add js object literals
// execute model tree, rendering

var content_tree = {};

var md_files = glob.sync("./_src/_blog/**/*.md");

md_files.forEach(function(e){
  console.log(e + "......................");

  var fmh = merge(
    frontMatter.loadFront(e),
    {path: e}
  );

  var path_keys = path.relative('./_src/', e).split('/');

  var mid_hash = path_keys.reduceRight(function(p, c, i, a){
    var b={};
    b[c]=p;
    return b;
  }, fmh);

  console.log(JSON.stringify(mid_hash));

  content_tree = merge(content_tree, mid_hash);

});

console.log('######');
console.log(JSON.stringify(content_tree));


// var blog_js = require('./_src/_blog/_blog.js');

// dir.paths(__dirname + '/_src/_blog/', function(err, paths) {

//   md_files = paths['files'].filter(function(filename){
//     return path.basename(filename)[0] != '_';
//   });

//   md_files.forEach(function(e){
//     fmh = merge(
//       frontMatter.loadFront(e),
//       {"path": e}
//     );

//     if (typeof blog_js['route_to'] != "undefined"){
//       destination = blog_js['route_to'](fmh);
//     } else{
//       destination = e.basename(filename)[0] != '_';
//     }

//     writeFileWithIndifferentWrite(destination, blog_js['process_content'](fmh));
//   });

// });