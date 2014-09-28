# Wongoloid

A stupid static website generator for programmers. Wongoloid does not, and shall never have, a plugin system. You have to write (almost) everything your self.

Wongoloid has one method, `crunch`, which accepts a configuration hash of tasks.

```js

var wongoloid = require("wongoloid");

wongoloid.crunch({

  foo: {

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
      // if you do not call the write_callback function,
      // it is incumbent upon you to write the output file yourself
    },

    output_all:  function(universe, write_callback){
      // called once for each key
      // if you do not call the write_callback function,
      // it is incumbent upon you to write the output file yourself
    }
  },

  bar: function(universe, output_callback){
    // a simpler case where a single function can suffice
  },

  // an even easier case. Just moves a single file
  baz:{'copy_from_this_file': 'to_this_file'}

});
```

Under the hood, Wongoloid does a few simple operations for each task: 

1. It builds a `universe` hash from the `input_each()` and `input_all()` functions, then writes to the file system using the `output_each()` and `output_all()` functions, in that order.
2. If a single function is supplied as the value, that will be executed as output.
3. Otherwise, it will attempt to copy the file that is the key to the file that is the value.

The `universe` is an immutable hash representing the global context. It has a few characteristic values
- a `config` describing the configuration
- a `self` representing the provincial context
  - `self` includes the results of `input_all`
  - `self.inputs()` is a list of the input files, each appended with the results of `input_each()`
- helpers methods based on the name of the keys. For instance, the example above will produce the helper methods `foo()`, `bar()`, and `baz()`
