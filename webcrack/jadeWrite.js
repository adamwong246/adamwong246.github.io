mkdirp = require('mkdirp');
jade = require("jade");
fs = require("fs");
minify = require('html-minifier').minify;

module.exports = function(out, template, locals, options) {
  return mkdirp(path.dirname(out), function(err) {
    var output;
    if (err) {
      return console.log(err);
    } else {
      if (options.minify) {
        output = minify(jade.renderFile(template, _.merge(options, locals)), {
          removeAttributeQuotes: true,
          removeComments: true,
          removeTagWhitespace: true,
          collapseWhitespace: true,
          minifyJS: true
        });
      } else {
        output = jade.renderFile(template, _.merge({
          pretty: true
        }, memoUniverse(), locals));
      }
      return fs.writeFile(out, output, function(err) {
        if (err) {
          return console.error(err);
        } else {
          return console.log("---> " + out);
        }
      });
    }
  });
};
