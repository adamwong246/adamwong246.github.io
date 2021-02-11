const $$$ = require('reselect').createSelector;

const {
	contentOfFile,
	contentsOfFiles,
	srcAndContentOfFile,
	srcAndContentOfFiles
} = require("../../funkophile/funkophileHelpers.js");

const PAGES = 'PAGES'

module.exports = {

	inputs: {
		[PAGES]: 'pages/**/*.jade',
	},

	outputs: (_) => {

		return $$$(
			srcAndContentOfFiles(_[PAGES]),
			(pages) => {
				return pages.map((page) => {
					const baseFileName = page.src.split('.')[1].split('/').slice(-1)[0];

					let dest, url;

					if (baseFileName !== 'index') {
						dest = `${baseFileName}/index.html`
						url = `/${baseFileName}/index.html`
					} else {
						dest = `index.html`
						url = `/index.html`
					};

					return {
						content: page.content,
						dest,
						url,
						title: baseFileName
					}
				})
			}
    );
	}
}
