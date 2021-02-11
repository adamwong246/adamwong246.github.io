const $$$ = require('reselect').createSelector;

const {
	contentOfFile,
	contentsOfFiles,
	srcAndContentOfFile,
	srcAndContentOfFiles
} = require("./funkophile/funkophileHelpers.js");

// extract your logic for easier testing
const {
	jadeRender,
	jadeRenderPageLayout,
	jadeRenderBlogEntry,
} = require("./funkophileUtils.js");

const srcFunkophile = require("./src/funkophile.js");

const NOT_FOUND_PAGE = 'NOT_FOUND_PAGE'
const VIEWS = 'VIEWS'

module.exports = {
	initialState: {},

	options: {
		inFolder: 'src',
		outFolder: 'dist'
	},

	encodings: {
		'utf8': ['md', 'css', 'jade', 'txt', 'json', 'js'],
		'': ['jpg', 'png', 'gif']
	},

	inputs: {
		...srcFunkophile.inputs,
    [NOT_FOUND_PAGE]: '404.jade',
    [VIEWS]: 'views/*.jade',
	},

	// return a selector based on the given selector '_'
	// the selector should return an object with keys for filenames and values of contents.
	// The contents can be a JSON-able, function or promise.

	outputs: (_) => {

		const $package = $$$(() => require("./package.json"));

		const srcSelector = srcFunkophile.outputs(_);

		return $$$([
			$$$([
				$$$([
					$package,
          srcSelector.$content,
					srcAndContentOfFile(_[VIEWS], './src/views/page.jade'),
					srcAndContentOfFile(_[VIEWS], './src/views/blogEntryLayout.jade'),
					contentOfFile(_[NOT_FOUND_PAGE]),
					srcAndContentOfFile(_[VIEWS], './src/views/resume.jade'),
				], (
					package,
          content,
          pageLayout, blogEntryLayout, notFoundContent, resumeLayout
				) => {

					const localsToJadeRender = {
						package,

						blogEntries: content.blog,
						contacts: content.contacts,
						pages: content.pages,
					}

					return {
						...(content.blog.reduce((mm, blogEntry) => {
							return {
								...mm,
								[blogEntry.dest]: jadeRenderBlogEntry(blogEntry, blogEntryLayout, localsToJadeRender)
							}
						}, {})),
						...(content.pages.reduce((mm, page) => {
							return {
								...mm,
								[page.dest]: jadeRender(page.content, pageLayout, localsToJadeRender)
							}
						}, {})),
						'resume.html': jadeRenderPageLayout(content.resume.content, resumeLayout, localsToJadeRender),

						// 404s break on github?
						// '404.html': jadeRender(notFoundContent, pageLayout, localsToJadeRender)
					}
				}),
				srcSelector.$all,
			], (
				html,

				srcAll
			) => {
				return {
          ...srcAll,
					...html,
					'README.md': fs.readFileSync('./README.md', 'utf8'),
				}
			})
		], (site) => {
			return {
				...site,
				'sitemap.html': `<ul>${Object.keys(site).sort((e)=>e).map((e)=> `<li><a href="/${e}"> ${e} </a></li>`).join('')}</ul>`
			}
		});
	}
}
