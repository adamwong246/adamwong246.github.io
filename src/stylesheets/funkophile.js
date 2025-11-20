import reselect from "reselect"
const $$$ = reselect.createSelector;
import {
  contentsOfFiles,
} from "funkophile/funkophileHelpers";
import fs from "fs";
import CleanCSS from "clean-css";

const cleandAndMinifyCss = (css) => {
  return new CleanCSS({
    keepSpecialComments: 2
  }).minify(css).styles
};

export default {

  inputs: {
    ['CSS']: 'stylesheets/*.css',
    ['RESUME_CSS']: 'stylesheets/resume/*.css'
  },

  outputs: (_) => {

    const normalizeDotCss = fs.readFileSync('./node_modules/normalize.css/normalize.css', 'utf8');

    const $webCss = $$$([
      contentsOfFiles(_['CSS']),
      $$$([], () => normalizeDotCss)]
      , (css, normalize) =>
      cleandAndMinifyCss(normalize + '\n' + css)
    );

    const $resumePdfCss = $$$([_['CSS'], _['RESUME_CSS']], (cssFiles, rf) => [
      normalizeDotCss,
      rf['/Users/adam/Code/adamwong246.github.io/src/stylesheets/resume/resume.css'],
      rf['/Users/adam/Code/adamwong246.github.io/src/stylesheets/resume/resume.pdf.css'],
      // Only include the resume-specific styles, not the full typography.css which has many font references
    ].join('\n'));

    const $resumeHtmlCss = $$$([_['CSS'], _['RESUME_CSS']], (cssFiles, rf) => [
      normalizeDotCss,
      rf['/Users/adam/Code/adamwong246.github.io/src/stylesheets/resume/resume.css'],
      rf['/Users/adam/Code/adamwong246.github.io/src/stylesheets/resume/resume.html.css'],
      // Only include the resume-specific styles, not the full typography.css which has many font references
    ].join('\n'));

    
    return {
      $webCss,
      $resumePdfCss,
      $resumeHtmlCss
    };
  }
}
