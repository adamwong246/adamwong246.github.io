const $$$ = require('reselect').createSelector;

const {
	contentOfFile,
	contentsOfFiles,
	srcAndContentOfFile,
	srcAndContentOfFiles
} = require("./webcrack/webcrackHelpers.js");

// extract your logic for easier testing
const {
	cleandAndMinifyCss,
	jpgTransformPromises,
	jadeRender,
	jadeRenderPageLayout,
	jadeRenderBlogEntry,
	makeResumePdf,
	processBlogEntries,
	transformJpegs,
	updateBlogImagePaths,
} = require("./webcrackUtils.js");

// One key for every file input pattern
const BLOG_ASSETS = 'BLOG_ASSETS'
const BLOG_ENTRIES = 'BLOG_ENTRIES'
const BLOG_ENTRIES_JPGS = 'BLOG_ENTRIES_JPGS'
const BLOG_ENTRIES_GIFS = 'BLOG_ENTRIES_GIFS'
const CONTACTS = 'CONTACTS'
const CSS = 'CSS';
const JPG = 'JPG'
const JPG_TRANSFORMS = 'JPG_TRANSFORMS'
const LICENSE = 'LICENSE';
const NOT_FOUND_PAGE = 'NOT_FOUND_PAGE'
const PAGES = 'PAGES';
const RESUME = 'RESUME';
const VIEWS = 'VIEWS'
const FAVICON_PNG = 'FAVICON_PNG'
const JS = 'JS'

module.exports = {
	initialState: {},

	// webcrack cannot deterministicly load content outside the inFolder
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
		[BLOG_ASSETS]: 'blogEntries/**/assets.json',
		[BLOG_ENTRIES_GIFS]: 'blogEntries/**/*.gif',
		[BLOG_ENTRIES_JPGS]: 'blogEntries/**/*.jpg',
		[BLOG_ENTRIES]: 'blogEntries/**/index.md',
		[CONTACTS]: 'contacts.json',
		[CSS]: 'stylesheets/*.css',
		[FAVICON_PNG]: 'images/evilShroom.png',
		[JPG_TRANSFORMS]: 'images/assets.json',
		[JPG]: 'images/*.jpg',
		[JS]: 'index.js',
		[LICENSE]: 'LICENSE.txt',
		[NOT_FOUND_PAGE]: '404.jade',
		[PAGES]: 'pages/**/*.jade',
		[RESUME]: 'resume.md',
		[VIEWS]: 'views/*.jade'
	},

	// return a selector based on the given selector '_'
	outputs: (_) => {

		const $package = $$$(() => require("./package.json"));

		const $blogEntries = $$$(
			srcAndContentOfFiles(_[BLOG_ENTRIES]),
			processBlogEntries
		);

		const $blogEntriesGifs = $$$([srcAndContentOfFiles(_[BLOG_ENTRIES_GIFS]), $blogEntries],
			(gifs, blogEntries) => gifs.reduce((mm, gif) => {
				const src = gif.src
				const gifSplit = src.split('/')
				return {
					...mm,
					[blogEntries.find((b) => src.includes(b.srcFolder)).destFolder + gifSplit[gifSplit.length - 1]]: gif.content
				}
			}, {})
		);

		const $blogEntriesJpgsOrginal = $$$([
			srcAndContentOfFiles(_[BLOG_ENTRIES_JPGS]),
			$blogEntries
		], (jpgs, blogEntries) => jpgs.reduce((mm, jpg) => {
			const src = jpg.src
			const jpgSplit = src.split('/')
			return {
				...mm,
				[blogEntries.find((b) => src.includes(b.srcFolder)).destFolder + jpgSplit[jpgSplit.length - 1]]: jpg.content
			}
		}, {}));

		const $blogEntriesJpgsModified = $$$([
			srcAndContentOfFiles(_[BLOG_ENTRIES_JPGS]),
			$$$(
				[srcAndContentOfFiles(_[BLOG_ASSETS])],
				(assets) => assets.map((asset) => {
					return {
						src: asset.src,
						json: JSON.parse(asset.content)
					}
				})
			),
			$blogEntries
		],  transformJpegs );

		const $resumeMarkdown = $$$(contentOfFile(_[RESUME]), markdown.parse)

		return $$$([$$$([
			contentOfFile(_[LICENSE]),
			contentOfFile(_[RESUME]),
			$$$(
				[$resumeMarkdown, $$$(_[CSS], (cssFiles) => [
					cssFiles['./src/stylesheets/typography.css'],
					cssFiles['./src/stylesheets/layout.css'],
					cssFiles['./src/stylesheets/style.css']
				].join('\n'))],
				(resumeMarkdown, css) => makeResumePdf(resumeMarkdown, css)),
			$$$([contentsOfFiles(_[CSS]), $$$([], () => fs.readFileSync('./node_modules/normalize.css/normalize.css', 'utf8'))], (css, normalize) =>
				cleandAndMinifyCss(normalize + '\n' + css)
			),
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
				$$$([
					$blogEntries, $$$([
						$blogEntriesJpgsOrginal,
						$blogEntriesJpgsModified
					], (originals, modifed) => {
						return {
							...originals,
							...modifed
						}
					}), $blogEntriesGifs
				], updateBlogImagePaths),
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
			], (package, pages, blogEntries, markdownResume, pageLayout, blogEntryLayout, notFoundContent, contacts) => {

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
					'resume.html': jadeRenderPageLayout(markdownResume.content, pageLayout, localsToJadeRender),
					'404.html': jadeRender(notFoundContent, pageLayout, localsToJadeRender)
				}
			}),
			$blogEntriesJpgsOrginal,
			$blogEntriesJpgsModified,
			$blogEntriesGifs,
			$$$(
				[_.JPG, contentOfFile(_[JPG_TRANSFORMS])], (jpgs, assets) => {
          return jpgTransformPromises(jpgs, assets)
        }
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
			gifs,
			jpgs,
			favicon,
			js
		) => {
			return {
				...blogJpegsMod,
				...blogJpegsOriginal,
				...gifs,
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
