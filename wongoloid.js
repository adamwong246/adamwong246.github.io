var util      = require("util");
var glob      = require("glob");
var globArray = require("glob-array");
var fs        = require('fs');
var deepMerge = require('deepmerge');
var extend    = require('extend');
var mkdirp    = require("mkdirp");

var eyes      = require('eyes');

module.exports = {
  crunch: function(chunks){

    var indifferentWriteFile = function(dest, content) {
      mkdirp(dest.split("/").slice(0, -1).join("/"), function(err) {
        if (err) {
          console.error(err);
        } else {
          fs.writeFile(dest, content);
        }
      });
    };

    var universe = {config: chunks};

    Object.keys(universe.config).forEach(function(chunkKey){

      console.log("- " + chunkKey);

      if (typeof(universe.config[chunkKey]) !== 'function'){

        var globbing;

        if (util.isArray(universe.config[chunkKey].glob_pattern)){
          globbing = globArray.sync(universe.config[chunkKey].glob_pattern);
        } else {
          globbing = glob.sync(universe.config[chunkKey].glob_pattern);
        }

        console.log("-- globbed files: " + globbing);

        universe.config[chunkKey].inputs = globbing.map(
          function(file){

            var a = deepMerge(
                {file: fs.readFileSync(file, 'utf8')},
                {path: file}
              );

            if (typeof universe.config[chunkKey].input_each !== 'undefined' && universe.config[chunkKey].input_each ){
              console.log("--- input_each: " + file);
              return deepMerge(universe.config[chunkKey].input_each(a), a);
            } else {
              return a;
            }

          }
        );

        // helper functions
        universe[chunkKey] = function(){
          if (universe.config[chunkKey].inputs.length > 1){
            return universe.config[chunkKey].inputs;
          } else {
            return universe.config[chunkKey].inputs[0];
          }
        };
      }

    });

    //
    // console.log(JSON.stringify(universe.config.css.inputs, null, 2));
    //

    Object.keys(universe.config).forEach(function(chunkKey){
      if (typeof universe.config[chunkKey].input_all !== 'undefined' && universe.config[chunkKey].input_all ){
        console.log("--- input_all: " + chunkKey);
        extend(universe.config[chunkKey], universe.config[chunkKey].input_all(universe.config[chunkKey]));
      }
    });

    Object.keys(universe.config).forEach(function(chunkKey){
      if (typeof(universe.config[chunkKey]) !== 'function'){
        universe.config[chunkKey].inputs.forEach(function(input){
          if (typeof universe.config[chunkKey].output_each !== 'undefined' && universe.config[chunkKey].output_each ){
            console.log("--- output_each: " + input.path);
            universe.config[chunkKey].output_each(deepMerge(universe, {self: input}), function(content, url){
              indifferentWriteFile ("./" + (url || input.url), content);
            });
          }
        });
      }

      if (typeof(universe.config[chunkKey]) !== 'function'){
        if (typeof universe.config[chunkKey].output_all !== 'undefined' && universe.config[chunkKey].output_all ){
          console.log("--- output_all: " + chunkKey);

          universe.config[chunkKey].output_all(deepMerge(universe, {self: universe.config[chunkKey]}), function(content, url){
              indifferentWriteFile ("./" + (url || universe.config[chunkKey].url), content);
          });

        }
      } else {
        console.log("--- output: " + chunkKey);
        universe.config[chunkKey](deepMerge(universe, {self: universe.config[chunkKey]}), function(content, url){
              indifferentWriteFile ("./" + (url || universe.config[chunkKey].url), content);
          });
      }

    });

  }
};