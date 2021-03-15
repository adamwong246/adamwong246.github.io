---
title: Unit Testing without dependencies
publishedAt: Mon Mar 15 2021 16:12:21 GMT-0700 (Pacific Daylight Time)
---

Unit testing forms the base of your tests strategy. It's the most granular type of tests- the testing of individual classes and functions. And in the context of the javascript world, where _everything_ is a function, this means that you are validating that, for some function, given some known data, the functions returns something that passses an assertion. Most JS devs will reach for a tool like jest, jasmine, mocha or chai when writing tests, but _that's not necessary._ It really isn't. Node provides just about everything you need to roll your own unit testing framework with just a little bit of effort.

<div id="firstCodeSection">
<div class="tab">
    <button class="tablinks" onclick="openTab(event, 'polybool', 'firstCodeSection')">polybool.test.js</button> 
    <button class="tablinks" onclick="openTab(event, 'test', 'firstCodeSection')">test.js</button>
    <button class="tablinks" onclick="openTab(event, 'output', 'firstCodeSection')">output</button>  
</div>

<div id="polybool" class="tabcontent active"><pre><code>
import assert from "assert";

import PolyBool from 'polybooljs';

import test0 from './test0.json';
import test1Fixtures from './testFixture1.js';
import test2 from './testFixture2.json';

PolyBool.polygon._tests = {
  "no segments produces no regions": {
    input: [{ segments: [] }],
    assertion: (polygon) => assert.strictEqual(0, polygon.regions.length)
  },

  "my failing segments": {
    input: [test0],
    assertion: (polygon) => assert.strictEqual(polygon.regions.length > 0, true)
  },

  "known good segments": {
    input: [test2],
    assertion: (polygon) => assert.strictEqual(polygon.regions.length > 0, true)
  }
}

PolyBool.intersect._tests = {
  "a basic intersect test": {
    input: test1Fixtures.input,
    assertion: (intersections) => assert.deepStrictEqual(intersections, test1Fixtures.output)
  },
}

export default PolyBool;
</code></pre></div>

<div id="test" class="tabcontent"><pre><code>
import assert from "assert";
import deepEqual from 'deep-equal';

import polyboolTests from "./polybool2.test.js";

function runTests(tests, subject) {
  console.log(subject.name)
  Object.keys(tests).forEach((testKey) => {
    const assertion = tests[testKey].assertion;
    try {
      assertion(subject(...tests[testKey].input));
      console.log(`✓  ${testKey}`);

    } catch (e) {
      if (e instanceof assert.AssertionError) {
        console.error(`❌  ${testKey}  --  ${assertion.toString()}`);
      } else {
        console.log("some other error: ", e);
      }
    }
  })
}

function idOfModuleWithExports(exportChunk, modules = module) {
  if (deepEqual(modules.exports, exportChunk) ) {
    return modules.id;
  } else {
    for (let i = 0; i < modules.children.length; i++){
      const checkChild = idOfModuleWithExports(exportChunk, modules.children[i]);
      if (checkChild){
        return checkChild
      }      
    }
  }
}

function testModule(testableModule, key) {
  const idOfTestedModule = idOfModuleWithExports(testableModule)
  console.log("Testing: ", idOfTestedModule)

  Object.keys(testableModule).some(function (k) {
    if (testableModule[k][key]) {
      runTests(testableModule[k][key], testableModule[k])
    }
  });

}

testModule(polyboolTests, "_tests")
</code></pre></div>

<div id="output" class="tabcontent"><pre><code>
{-^ω^}-  yarn test                                                                                                ~/Programming/SpaceTrash/src/apps/experiments/rotFovReact fov ●●●
yarn run v1.5.1
(node:73151) [DEP0005] DeprecationWarning: Buffer() is deprecated due to security and usability issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
warning package.json: No license field
warning ../../../../package.json: "dependencies" has dependency "express" with range "^4.17.1" that collides with a dependency in "devDependencies" of the same name with version "~4.14.1"
$ node -r esm src/test.js
Testing:  /Users/adam/Programming/SpaceTrash/src/apps/experiments/rotFovReact/node_modules/polybooljs/index.js
polygon
✓  no segments produces no regions
❌  my failing segments  --  (polygon) => assert.strictEqual(polygon.regions.length > 0, true)
✓  known good segments
intersect
✓  a basic intersect test
✨  Done in 0.75s.

</code></pre></div>

</div>

See? You don't need all those extra depedencies, plus you get some insight into just how Node assertions work.

## Specifying the tests

This approach literally adds the tests themselves to the subject-functions themselves. It's not something you think if often, but it's quite possible- to apply properties, not to classes or objects, but to _functions_. I chose the key `_tests` to specify this property. This value associated with this key is the tests themseves- a description of the test as a key, some input and finally the assertion itself. Finally, we export that classes with it's tests. 

## Running the tests

To run these tests, just import the test-module and pass them to an incredibly simply function, which enumerates over the import looking for the `_tests` key. When it finds the matching module, it runs the test, catching any AssertionErrors, without which the process would exit on failure. 

## Why it is great.

Depedencies, even realtively simple ones, are a liablility. Every depedency is a potential vector for confusion, bugs and tech abandonment. In this case, it's proably not a big fear, but still, rolling your own stuff is often a valuable learning experience. And this definition is **tight**- more of a DSL, than JS really. It's almost simple enought that a PM could read it!

<style>
  .tabcontent:not(.active) {
    /* background-color: red; */
    display:none;
  }

  .tabcontent.active {
    background-color: darkgrey;
  }
</style>

<script>
function openTab(evt, tabName, tabCollection) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementById(tabCollection).getElementsByClassName("tabcontent")

  
  for (i = 0; i < tabcontent.length; i++) {
    console.log(tabcontent[i])

    if (tabcontent[i].id === tabName){
      tabcontent[i].classList.add("active")
    } else {
      tabcontent[i].classList.remove("active")
    }
  }
}

</script>