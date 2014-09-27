# wongoloid

A stupid static website generator for programmers. 

```js

var wongoloid = require("wongoloid")

wongoloid.crunch({
  key: {

    files: "a file or glob pattern of files to read",

    input_each: function(member){
      // called for each individual file in "files"
      // return a hash which are appended to the individual items 'self'
    },

    input_all: function(){
      // called once per key
      // returns a hash which is appended to the config object's self
    },

    output_each:  function(universe){
      // called for each individual file in "files"
      // returns the value to be saved to a file
    },

    output_all:  function(universe){
      // called once for each key
      // returns the value to be saved to a file
    }
  }
});
```