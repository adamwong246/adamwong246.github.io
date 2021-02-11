import {
	createSelector as $$$
} from 'reselect';

import {
	contentOfFile,
	contentsOfFiles,
	srcAndContentOfFile,
	srcAndContentOfFiles
} from "../../../funkophile/funkophileHelpers.js";

const FUNKYBUNDLE = 'FUNKYBUNDLE'

export default {

	inputs: {
    [FUNKYBUNDLE]: 'projects/funkybundle/index.js'
	},

	outputs: (_) => {

		const blogSelector = blogEntries.outputs(_);
		const cssSelector = styleFunkophile.outputs(_);
		const pageSelectors = pagesFunkophile.outputs(_);

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

		const $funkybundle = contentOfFile(_["FUNKYBUNDLE"]);

		return {
			$pages: pageSelectors,
			...blogSelector,

			$resume,
			$js,
			$favicon,
			$resumeMarkdown,

			$content: $$$([pageSelectors, blogSelector.$blog, $resumeMarkdown, $$$(contentOfFile(_["CONTACTS"]), (contactsString) => JSON.parse(contactsString).map((c) => {
				return {
					'type': Object.keys(c)[0],
					'content': c[Object.keys(c)[0]],
					'icon': simpleIcons.get(Object.keys(c)[0]).svg
				}
			}))], (p, b, r, c) => {
				return {
					pages: p,
					blog: b,
					resume: r,
					contacts: c
				}

			}),

			$all: $$$([
				$resume, $favicon, $js, $license, $resumePdf, cssSelector.$webCss, blogSelector.$allBlogAssets,
				$$$(
					[_.JPG, contentOfFile(_["JPG_TRANSFORMS"])], jpgTransformPromises
				),
        $funkybundle
			], (
				r, f, j, l, rsmPdf, css, allBlogAssets, jpgs, funkybundle
			) => {
        console.log(funkybundle)
				return {
					'resume.md': r,
					'favicon.png': f,
					'index.js': j,
					'LICENSE.txt': l,
					'resume.pdf': rsmPdf,
					'style.css': css,
					...allBlogAssets,
					...jpgs,
          'funkybundle/funkybundle.js': funkybundle
				}
			})

		}
	}
}
