---
title: Introducing webcrack - the build tool you never wanted
publishedAt: Mon Mar 23 2020 12:12:43 GMT-0700 (Pacific Daylight Time)
---

[webcrack](https://github.com/adamwong246/adamwong246.github.io/tree/dev/webcrack) is a thing I've been building on the side. It was inspired by webpack, but it's very different.

Whereas webpack is designed to make js bundles, webcrack is designed to make files. Put very simply, webcrack watches a series of files in a source folder, and when they change, pass those to Redux store, which is then pulled apart with Reselect selectors, and the changes are written back to a destination folder. The practical upshot of this is that you can abstract difficult logic into memoized selectors, without having to deal with dependencies and the annoyance of writing to the disk! Webcrack isn't a task runner either, though it can be used as one. It has a very broad use case and can be used anytime you need to process files in a complex way, provided you have a good understanding of Redux and Reselect.

## an example

In this simple example, we are watching for changes to css files, which are merged together, alongside normalize.css, and then minified.

###webcrack.config.js

```javascript
// you need to import reselect's createSelector function in order to perform memoized logic
createSelector = require('reselect').createSelector;

// import anything! you want to use in your selectors, provided they are *purely functional*
CleanCSS = require('clean-css');

module.exports = {
  initialState: {},

  // where to read and write the files
  options: {
    inFolder: 'src',
    outFolder: 'dist'
  },

  // webcrack needs to know the encoding of tile types
  encodings: {
    'utf8': [css'],
  },

  // defines the inputs points where files will be read
  inputs: {
    css: 'assets/*.css',
  },

  // defines the output points
  // `selectors` are keyed on your inputs for easier memoization
  // must return a function of state, which returns a hash
  // where every key is a file and every value is the contents of that file
  outputs: (selectors) => {

    const styleSelector = createSelector([selectors.css], (css) => {
      return Object.keys(css).reduce((mm, k) => mm + css[k], '')
    })

    const cssOutput = createSelector(styleSelector, (css) => {
      return new CleanCSS({
        keepSpecialComments: 0
      }).minify(
        [
          css,
          fs.readFileSync('./node_modules/normalize.css/normalize.css', 'utf8')
        ].join('\n')
      ).styles
    });

    // return a hash objects based on the state.
    //Each key is a file and each value is the contents of that file
    return createSelector([
      cssOutput,
    ], (style) => {

      return {
        'style.css': style,
      }
    });
  }
}
```
In this simple example, we are watching for changes to css files, which are merged together, alongside normalize.css, and then minified.

if you run webcrack alongside a file server, you have an instant development environment!

## an more complex example

[Here](https://github.com/adamwong246/adamwong246.github.io/blob/dev/webcrack.config.js) you can see the webcrack.config.js file which is used to build this site.

## but WHY?

Webpack is neat but sometimes you don't need a client-side SPA. Github Pages for instance does not support client-side routing because, though it does host your files, it doesn't provide redirect rules.

Gulp and Grunt are ok but their reliance of community-plugins is, IMHO, an liability. I almost always prefer to avoid dependencies, especially for trivial tasks.

[Webcrack itself](https://github.com/adamwong246/adamwong246.github.io/blob/dev/webcrack/index.js) is *tiny* and extremely hackable. It has very few of it's own dependencies.

## Give it a try

I've not yet made webcrack a formal NPM package but for now you can try it out from [here](https://github.com/adamwong246/adamwong246.github.io/tree/dev/webcrack)
