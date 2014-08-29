////test
var treeMerge = require('./index');
var assert = require('assert');

var a=[["1"],[2,3,[11,[123], 11]], [22,[[123]]]];
var b=[["1"],[2,3,[11, 11]], [22,[[[123]]]],[2234]];
var expect = [["1"],[2,3,[11,[123],11, 11]],[22,[[123,[123]]]],[2234]];
var c=treeMerge(a, b);

assert.deepEqual(expect,c);
