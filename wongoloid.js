var glob      = require("glob");
var fs        = require('fs');
var deepMerge = require('deepmerge');
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
    universe.config[chunkKey].inputs = glob.sync(universe.config[chunkKey].files).map(
      function(file){

        var a = deepMerge(
            {file: fs.readFileSync(file, 'utf8')},
            {path: file}
          );

        return deepMerge(universe.config[chunkKey].input(a), a);
      }
    );

    universe[chunkKey] = function(){
      if (universe.config[chunkKey].inputs.length > 1){
        return universe.config[chunkKey].inputs;
      } else {
        return universe.config[chunkKey].inputs[0];
      }
    };

  });

  eyes.inspect(universe);

  Object.keys(universe.config).forEach(function(chunkKey){
    universe.config[chunkKey].inputs.forEach(function(input){

      indifferentWriteFile ("./" + input.url, universe.config[chunkKey].output(
        deepMerge(universe, {self: input})
      ));


    });
  });

}};