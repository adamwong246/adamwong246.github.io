import path from "path"
import reselect from "reselect"
const $$$ = reselect.createSelector;
import {
  contentOfFile,
  contentsOfFiles,
  srcAndContentOfFile,
  srcAndContentOfFiles,
} from "funkophile/funkophileHelpers";

const PAGES = 'PAGES'

export default {

	inputs: {
		[PAGES]: 'pages/**/*.jade',
	},

	outputs: (_) => {

		return $$$(
			srcAndContentOfFiles(_[PAGES]),
			(pages) => {

				// console.log("pages", pages)
				// process.exit()

				return pages.map((page) => {
					const baseFileName = path.basename(page.src).split('.')[0];//.split('/').slice(-1)[0];

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
