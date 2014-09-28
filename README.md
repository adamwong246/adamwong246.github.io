# Wongoloid

A stupid static website generator for programmers. Wongoloid does not, and shall never have, a plugin system. You have to write (almost) everything your self. 

Wongoloid has one method, `crunch`, which accepts a configuration hash.

```js

var wongoloid = require("wongoloid")

wongoloid.crunch({
  key: {

    glob_pattern: "a file or glob pattern of files to read as input",

    input_each: function(member){
      // called for each individual file in "glob_pattern"
      // return a hash which are appended to the individual items 'self'
    },

    input_all: function(collection){
      // called once per key
      // returns a hash which is appended to the config object's self
    },

    output_each:  function(universe, write_callback){
      // called for each individual file in "glob_pattern"
      // if you do not call the write_callback function, it is incumbent upon you to write the output file yourself
    },

    output_all:  function(universe, write_callback){
      // called once for each key
      // if you do not call the write_callback function, it is incumbent upon you to write the output file yourself
    }
  }
});
```

Under the hood, Wongoloid does a single simple operation: It builds a `universe` hash from the `input_each` and `input_all` functions, then writes to the file system using the `output_each` and `output_all` functions, in that order.

The `universe` is a hash representing the global context. It has a few characteristic values
- a `config` describing the configuration
- a `self` representing the provincial context
- helpers methods based on the name of the keys. For instance, 
```json
{
  foobars: {...}
}
```
will create a helper method `foobars()`