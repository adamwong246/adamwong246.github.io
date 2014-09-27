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

      var globbing;

      if (util.isArray(universe.config[chunkKey].files)){
        globbing = globArray.sync(universe.config[chunkKey].files);
      } else {
        globbing = glob.sync(universe.config[chunkKey].files);
      }

      console.log("-- globbed files: " + globbing);

    universe.config[chunkKey].inputs = globbing.map(
      function(file){

        var a = deepMerge(
            {file: fs.readFileSync(file, 'utf8')},
            {path: file}
          );

        if (typeof universe.config[chunkKey].input !== 'undefined' && universe.config[chunkKey].input ){
          return deepMerge(universe.config[chunkKey].input(a), a);
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

  });

  // console.log(JSON.stringify(universe.config.css.inputs, null, 2));

  Object.keys(universe.config).forEach(function(chunkKey){
    if (typeof universe.config[chunkKey].input_all !== 'undefined' && universe.config[chunkKey].input_all ){

      extend(universe.config[chunkKey], universe.config[chunkKey].input_all(universe.config[chunkKey]));
    }
  });

  Object.keys(universe.config).forEach(function(chunkKey){
    universe.config[chunkKey].inputs.forEach(function(input){

      if (typeof universe.config[chunkKey].output !== 'undefined' && universe.config[chunkKey].output ){
        indifferentWriteFile ("./" + input.url, universe.config[chunkKey].output(
          deepMerge(universe, {self: input})
        ));
      }


    });

    if (typeof universe.config[chunkKey].output_all !== 'undefined' && universe.config[chunkKey].output_all ){

      indifferentWriteFile ("./" + universe.config[chunkKey].url, universe.config[chunkKey].output_all(
        deepMerge(universe, {self: universe.config[chunkKey]})
      ));
    }

  });



}};