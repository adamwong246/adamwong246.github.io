TreeMerge
-------------

tree merge

How to use
-------------

```sh
$ npm install tree-merge -S
```

```js
////test
var treeMerge = require('tree-merge');
var assert = require('assert');

var a=[["1"],[2,3,[11,[123], 11]], [22]];
var b=[["1"],[2,3,[11, 11]], [22],[2234]];
var expect = [["1"],[2,3,[11,[123],11],[11, 11]],[22],[2234]];
var c=treeMerge(a, b);

assert.deepEqual(expect,c);
```
