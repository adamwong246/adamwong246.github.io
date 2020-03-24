// you need to import reselect's createSelector function in order to perform memoized loigc
createSelector = require('reselect').createSelector;

// import anything! you want to use in your selectors, provided they are *purely functional*
CleanCSS = require('clean-css');
fs = require('fs');
jade = require("jade");
markdown = require('marky-mark');
markdownpdf = require("markdown-pdf")
moment = require('moment');
slug = require('slug');
moment = require("moment")

const webcrackSelectors = require("./webcrackSelectors.js");

const simpleInput = (license, payload) => payload.contents
const objectInput = (state, payload) => {
  return {
    ...state,
    ...{
      [payload.src]: payload.contents
    }
  }
};

module.exports = {
  initialState: {
    views: {},
    pages: {},
    blogEntries: {},
    blogEntriesJpgs: [],
    css: {},
    resume: "",
    license: ""
  },

  options: {
    inFolder: 'src',
    outFolder: 'dist'
  },

  encodings: {
    'utf8': ['md', 'css', 'jade', 'txt'],
    '': ['jpg']
  },

  // defines the inputs points where files will be read
  // and a mutator of redux state
  inputs: {
    license: {
      'LICENSE.txt': simpleInput
    },
    resume: {
      'resume.md': simpleInput
    },
    css: {
      'assets/*.css': objectInput
    },
    pages: {
      'pages/**/*.jade': objectInput
    },
    blogEntries: {
      'blogEntries/**/index.md': objectInput
    },
    views: {
      'views/*.jade': objectInput
    },
    blogEntriesJpgs: {
      'blogEntries/**/*.jpg': (blogEntriesJpgs, payload) => {
        return [
          ...blogEntriesJpgs,
          {
            src: payload.src,
            contents: payload.contents
          }
        ]
      }
    },
  },

  // defines the output points based on a base selector which is subscribed to changes in the redux state
  outputs: (reduxState) => {

    const outputSelectors = webcrackSelectors(reduxState);

    // Lastly, return the output points and the selectors which feed them
    // each item needs to return an array of objects
    // where the `key` is a file and the `value` is the file contents
    return {
      // a debugging selector will write a json file of the state on every change
      // webcrackstate: createSelector([reduxState], (state) => {return {'state.json': JSON.stringify(state, null, 1)}}),

      // simply copies the file
      blogEntriesJpgs: outputSelectors.blogEntriesJpgsOutput,
      cssFile: outputSelectors.cssOutput,
      htmlFiles: outputSelectors.htmlFileOutput,
      license: outputSelectors.licenseOutput,
      resumeMd: outputSelectors.resumeMdOuput,
      resumePdf: outputSelectors.resumePdfOutput,

    }
  }
}
