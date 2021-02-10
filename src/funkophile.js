const $$$ = require('reselect').createSelector;

const styleFunkophile = require("./stylesheets/funkophile.js")

const makeResumePdf = (resumeMarkdown, css, pdfSettings) => {
	return (async () => {
		try {
			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			await page.setContent(resumeMarkdown.content)
			await page.addStyleTag({
				content: css
			})
			const pdf = await page.pdf({
				path: '/dev/null',
				...JSON.parse(pdfSettings)
			});
			await browser.close();

			// clear the timestamp for deterministic pdfs
			for (const offset of [97, 98, 99, 100, 132, 133, 134, 135]) {
				pdf[offset] = 0;
			}
			return pdf
		} catch (e) {
			console.error(e);
			return e;
		} finally {
			// console.log('We do cleanup here');
		}

	})();
};

const {
	contentOfFile,
	contentsOfFiles,
	srcAndContentOfFile,
	srcAndContentOfFiles
} = require("../funkophile/funkophileHelpers.js");
//
// const {
// 	transformJpegs,
// } = require("../../funkophileUtils.js");

const CONTACTS = 'CONTACTS'
const FAVICON_PNG = 'FAVICON_PNG'

module.exports = {

	inputs: {
		[CONTACTS]: 'contacts.json',
		[FAVICON_PNG]: 'images/evilShroom.png',
		...styleFunkophile.inputs
	},


	outputs: (_) => {

		const cssSelector = styleFunkophile.outputs(_);

		const $resume = contentOfFile(_["RESUME"]);
		const $js = contentOfFile(_["JS"]);
		const $favicon = contentOfFile(_["FAVICON_PNG"]);
		const $license = contentOfFile(_["LICENSE"]);


		const $resumeMarkdown = $$$($resume, markdown.parse);

		const $resumePdf = $$$(
			[
				$resumeMarkdown,
				cssSelector.$pdfCss,
				contentOfFile(_["PDF_SETTINGS"]),
			],
			(resumeMarkdown, css, pdfSettings) => makeResumePdf(resumeMarkdown, css, pdfSettings))

		return {
			$resume,
			$js,
			$favicon,
			$resumeMarkdown,

			$contacts: $$$(contentOfFile(_[CONTACTS]), (contactsString) => JSON.parse(contactsString).map((c) => {
				return {
					'type': Object.keys(c)[0],
					'content': c[Object.keys(c)[0]],
					'icon': simpleIcons.get(Object.keys(c)[0]).svg
				}
			})),

			$all: $$$([$resume, $favicon, $js, $license, $resumePdf, cssSelector.$webCss], (r, f, j, l, rsmPdf, css) => {
				return {
					'resume.md': r,
					'favicon.png': f,
					'index.js': j,
					'LICENSE.txt': l,
					'resume.pdf': rsmPdf,
          'style.css': css
				}
			})

		}
	}
}
