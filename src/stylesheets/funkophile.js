import reselect from "reselect"
const $$$ = reselect.createSelector;
import {
  contentOfFile,
  contentsOfFiles,
  srcAndContentOfFile,
  srcAndContentOfFiles,
} from "funkophile/funkophileHelpers";
import fs from "fs";
import CleanCSS from "clean-css";
// const $$$ = require('reselect').createSelector;
// fs = require('fs');
// CleanCSS = require('clean-css');

// const {
//   contentOfFile,
//   contentsOfFiles,
//   srcAndContentOfFile,
//   srcAndContentOfFiles
// } = require("../../funkophile/funkophileHelpers.js");

const CSS = 'CSS';

const cleandAndMinifyCss = (css) => {
  return new CleanCSS({
    keepSpecialComments: 2
  }).minify(css).styles
};

export default {

  inputs: {
    [CSS]: 'stylesheets/*.css'
  },

  outputs: (_) => {

    const normalizeDotCss = fs.readFileSync('./node_modules/normalize.css/normalize.css', 'utf8');

    const $webCss = $$$([contentsOfFiles(_[CSS]), $$$([], () => normalizeDotCss)], (css, normalize) =>
      cleandAndMinifyCss(normalize + '\n' + css)
    );

    const $pdfCss = $$$(_[CSS], (cssFiles) => [
      normalizeDotCss,
      cssFiles['./src/stylesheets/resume.css'],
      cssFiles['./src/stylesheets/typography.css'],
      cssFiles['./src/stylesheets/style.css'],

    ].join('\n'));

    return {
      $webCss,
      $pdfCss
    };
  }
}