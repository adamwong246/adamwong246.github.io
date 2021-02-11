const $$$ = require('reselect').createSelector;
fs = require('fs');
CleanCSS = require('clean-css');

const {
	contentOfFile,
	contentsOfFiles,
	srcAndContentOfFile,
	srcAndContentOfFiles
} = require("../../funkophile/funkophileHelpers.js");

const CSS = 'CSS';

const cleandAndMinifyCss = (css) => {
	return new CleanCSS({
		keepSpecialComments: 2
	}).minify(css).styles
};

module.exports = {

	inputs: {
		[CSS]: 'stylesheets/*.css'
	},

	outputs: (_) => {

		const $webCss = $$$([contentsOfFiles(_[CSS]), $$$([], () => fs.readFileSync('./node_modules/normalize.css/normalize.css', 'utf8'))], (css, normalize) =>
			cleandAndMinifyCss(normalize + '\n' + css)
		);

		const $pdfCss = $$$(_[CSS], (cssFiles) => [
			cssFiles['./src/stylesheets/typography.css'],
			cssFiles['./src/stylesheets/layout.css'],
			cssFiles['./src/stylesheets/style.css']
		].join('\n'));

		return {
			$webCss,
			$pdfCss
		};
	}
}
