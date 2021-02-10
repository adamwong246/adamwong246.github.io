const $$$ = require('reselect').createSelector;

const {
	contentOfFile,
	contentsOfFiles,
	srcAndContentOfFile,
	srcAndContentOfFiles
} = require("./funkophile/funkophileHelpers.js");

// extract your logic for easier testing
const {
	jpgTransformPromises,
	jadeRender,
	jadeRenderPageLayout,
	jadeRenderBlogEntry,
	makeResumePdf,
} = require("./funkophileUtils.js");

const $blogEntries = require("./src/blogEntries/funkophile.js");
const styleFunkophile = require("./src/stylesheets/funkophile.js");

const CONTACTS = 'CONTACTS'
const JPG = 'JPG'
const JPG_TRANSFORMS = 'JPG_TRANSFORMS'
const LICENSE = 'LICENSE';
const NOT_FOUND_PAGE = 'NOT_FOUND_PAGE'
const PAGES = 'PAGES';
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
    ...$blogEntries.inputs,
		...styleFunkophile.inputs,
		[CONTACTS]: 'contacts.json',
		[FAVICON_PNG]: 'images/evilShroom.png',
		[JPG_TRANSFORMS]: 'images/assets.json',
		[JPG]: 'images/*.jpg',
		[JS]: 'index.js',
		[LICENSE]: 'LICENSE.txt',
		[NOT_FOUND_PAGE]: '404.jade',
		[PAGES]: 'pages/**/*.jade',
		[RESUME]: 'resume.md',
		[VIEWS]: 'views/*.jade',
    [PDF_SETTINGS]: 'pdfSettings.json',
	},

	// return a selector based on the given selector '_'
	outputs: (_) => {

		const $package = $$$(() => require("./package.json"));

		const $resumeMarkdown = $$$(contentOfFile(_[RESUME]), markdown.parse)

		const blogSelector = $blogEntries.outputs(_);
		const cssSelector = styleFunkophile.outputs(_);

		return $$$([$$$([
			contentOfFile(_[LICENSE]),
			contentOfFile(_[RESUME]),
			$$$(
				[
					$resumeMarkdown,
					cssSelector.$pdfCss,
					contentOfFile(_[PDF_SETTINGS]),
				],
				(resumeMarkdown, css, pdfSettings) => makeResumePdf(resumeMarkdown, css, pdfSettings)),
        cssSelector.$webCss,
			$$$([
				$package,
				$$$(
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
					}),
          blogSelector.$blog,
				$resumeMarkdown,
				srcAndContentOfFile(_[VIEWS], './src/views/page.jade'),
				srcAndContentOfFile(_[VIEWS], './src/views/blogEntryLayout.jade'),
				contentOfFile(_[NOT_FOUND_PAGE]),
				$$$(contentOfFile(_[CONTACTS]), (contactsString) => JSON.parse(contactsString).map((c) => {
					return {
						'type': Object.keys(c)[0],
						'content': c[Object.keys(c)[0]],
						'icon': simpleIcons.get(Object.keys(c)[0]).svg
					}
				})),

        srcAndContentOfFile(_[VIEWS], './src/views/resume.jade'),
			], (
        package, pages, blogEntries, markdownResume, pageLayout, blogEntryLayout, notFoundContent, contacts, resumeLayout
      ) => {

				const localsToJadeRender = {
					blogEntries,
					pages,
					package,
					contacts
				}

				return {
					...(blogEntries.reduce((mm, blogEntry) => {
						return {
							...mm,
							[blogEntry.dest]: jadeRenderBlogEntry(blogEntry, blogEntryLayout, localsToJadeRender)
						}
					}, {})),
					...(pages.reduce((mm, page) => {
						return {
							...mm,
							[page.dest]: jadeRender(page.content, pageLayout, localsToJadeRender)
						}
					}, {})),
					'resume.html': jadeRenderPageLayout(markdownResume.content, resumeLayout, localsToJadeRender),

					// 404s break on github?
					// '404.html': jadeRender(notFoundContent, pageLayout, localsToJadeRender)
				}
			}),
			blogSelector.$blogEntriesJpgsOrginal,
			blogSelector.$blogEntriesJpgsModified,
			blogSelector.$blogEntriesGifs,
			blogSelector.$blogEntriesMovs,
			$$$(
				[_.JPG, contentOfFile(_[JPG_TRANSFORMS])], jpgTransformPromises
			),
			contentOfFile(_[FAVICON_PNG]),
			contentOfFile(_[JS])
		], (
			license,
			resumeMd,
			resumePdf,
			style,
			html,
			blogJpegsOriginal,
			blogJpegsMod,
			blogGifs,
			blogMovs,
			jpgs,
			favicon,
			js
		) => {

			return {
				...blogJpegsMod,
				...blogJpegsOriginal,
				...blogGifs,
        ...blogMovs,

				...html,
				...jpgs,

				'favicon.png': favicon,
				'index.js': js,
				'LICENSE.txt': license,
				'README.md': fs.readFileSync('./README.md', 'utf8'),
				'resume.md': resumeMd,
				'resume.pdf': resumePdf,
				'style.css': style,
			}
		})], (site) => {
			return {
				...site,
				'sitemap.html': `<ul>${Object.keys(site).sort((e)=>e).map((e)=> `<li><a href="/${e}"> ${e} </a></li>`).join('')}</ul>`
			}
		});
	}
}
