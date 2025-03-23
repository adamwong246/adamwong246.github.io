---
title: Testeranto and Esbuild
publishedAt: Sun Mar 23 2025 00:34:44 GMT-0700 (Pacific Daylight Time)
---

Esbuild is one of my most favorite-est tools. It's built into the heart of testeranto, and it's used in 2 ways.

One key point of testeranto is that it can test _any_ piece of javascript. Some javascript depends upon features of node v8 and is meant to be run on the backend. On the other hand, some javascript is meant to be run only in the browser, if it references `window` or `document`. Testeranto handles both by using esbuild to create 2 seperate runtime bundles, one for all the node-ish tests and another for all the browser-ish tests. 

The second way in which testeranto leverages esbuild is to trace input files to output files. For every testable target, esbuild will emit the list of files which were sourced in it's build process. This list of files is in turn fed into the aider prompt. Rather tha load the entire codebase into the prompt, we can ensure the LLM only considers the salient files. 