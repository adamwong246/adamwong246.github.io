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

// const blogEntries = require("./src/blogEntries/funkophile.js");
const srcFunkophile = require("./src/funkophile.js");

const JPG = 'JPG'
const JPG_TRANSFORMS = 'JPG_TRANSFORMS'
const LICENSE = 'LICENSE';
const NOT_FOUND_PAGE = 'NOT_FOUND_PAGE'
// const PAGES = 'PAGES';
const RESUME = 'RESUME';
const VIEWS = 'VIEWS'
const FAVICON_PNG = 'FAVICON_PNG'
const JS = 'JS'
const PDF_SETTINGS = 'PDF_SETTINGS'

module.exports = {
	initialState: {},

	// funkophile cannot deterministicly load content outside the inFolder
	options: {
		inFolder: 'src',
		outFolder: 'dist'
	},

	// how you want your files loaded
	encodings: {
		'utf8': ['md', 'css', 'jade', 'txt', 'json', 'js'],
		'': ['jpg', 'png', 'gif']
	},

	// defines the inputs points where files will be read and their key within the Redux store
	inputs: {
		...srcFunkophile.inputs,
		[JPG_TRANSFORMS]: 'images/assets.json',
		[JPG]: 'images/*.jpg',
		[JS]: 'index.js',
		[LICENSE]: 'LICENSE.txt',
		[NOT_FOUND_PAGE]: '404.jade',
		// [PAGES]: 'pages/**/*.jade',
		[RESUME]: 'resume.md',
		[VIEWS]: 'views/*.jade',
		[PDF_SETTINGS]: 'pdfSettings.json',
	},

	// return a selector based on the given selector '_'
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
