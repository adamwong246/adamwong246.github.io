cheerio = require("cheerio");
CleanCSS = require('clean-css');
fs = require('fs');
jade = require("jade");
lwip = require("js-lwip");
markdown = require('marky-mark');
moment = require('moment');
puppeteer = require('puppeteer');
simpleIcons = require('simple-icons');
slug = require('slug');

module.exports = {
	processBlogEntries: (blogEntries) => {
		return blogEntries.map((blogEntry) => {
				const markdownContent = markdown.parse(blogEntry.content)
				const entryId = blogEntry.src.split('/')[3]
				const slugPath = "blog/" + entryId + '-' + (slug(markdownContent.meta.title)) + "/"
				const filePath = slugPath + 'index.html';
				return {
					meta: markdownContent.meta,
					markdownContent: markdownContent.content,
					dest: filePath,
					url: `/${filePath}`,
					destFolder: slugPath,
					srcFolder: blogEntry.src.split('index.md')[0],
					entryId
				}
			})
			.sort((b, a) => moment(a.meta.publishedAt)
				.diff(moment(b.meta.publishedAt)))
			.map((lmnt, ndx, ry) => {

				if (ndx === ry.length - 1) {
					lmnt.meta.previous = null;
				} else {
					const previous = ry[ndx + 1];
					lmnt.meta.previous = {
						url: previous.url,
						title: previous.meta.title,
					};
				}

				if (ndx === 0) {
					lmnt.meta.next = null;
				} else {
					const next = ry[ndx - 1];
					lmnt.meta.next = {
						url: next.url,
						title: next.meta.title,
					};
				}

				return lmnt
			})
	},

	jpgTransformPromises: (jpgs, assets) => {
		return Object.keys(jpgs)
			.reduce((mm, jKey) => {
				const shortFileName = jKey.split('/')[3]
				mm[jKey.split('/').slice(-2).join('/')] = jpgs[jKey]
				const transformations = JSON.parse(assets)[shortFileName]
				if (transformations) {

					Object.keys(transformations).forEach((transformationKey) => {

						mm['images/' + transformationKey + '-' + shortFileName] = new Promise((res, rej) => lwip.open(jpgs[jKey], 'jpg', (err, image) => {

							const batchImage = image.batch()
							transformations[transformationKey].forEach((transform) => {
								ts = Object.keys(transform)[0]
								args = transform[ts]
								if (args.length) {
									batchImage[ts](...transform[ts])
								} else {
									batchImage[ts](transform[ts])
								}
							});

							batchImage.toBuffer('jpg', {}, (err, buffer) => {
								res(buffer)
							})
						}))

					}, {})

				}
				return mm;
			}, {})
	},

	cleandAndMinifyCss: (css) => {
		return new CleanCSS({
			keepSpecialComments: 2
		}).minify(css).styles
	},

	makeResumePdf: (resumeMarkdown, css, pdfSettings) => {
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
	},

	transformJpegs: (jpgs, assets, blogEntries) => {
		return jpgs.reduce((mm, jpg) => {
			const src = jpg.src
			const jpgSplit = src.split('/')

			const asset = assets.find((asset) => {
				return src.split('/').slice(0, -1).join('') === asset.src.split('/').slice(0, -1).join('')
			})

			if (asset) {
				const assetManifest = asset.json
				const transformations = assetManifest[jpgSplit.slice(-1)[0]]

				modifiedJpgs = Object.keys(transformations).reduce((mmm, transformationKey) => {
					const transformation = transformations[transformationKey]

					const modifedImagePromise = new Promise((res, rej) => {
						return lwip.open(jpg.content, 'jpg', (err, image) => {

							const batchImage = image.batch()
							transformation.forEach((transform) => {
								ts = Object.keys(transform)[0]
								args = transform[ts]
								if (args.length) {
									batchImage[ts](...transform[ts])
								} else {
									batchImage[ts](transform[ts])
								}
							});

							batchImage.toBuffer('jpg', {}, (err, buffer) => {
								res(buffer)
							})
						});
					})

					const blogFolder = blogEntries.find((b) => src.includes(b.srcFolder)).destFolder

					return {
						...mmm,
						[blogFolder + transformationKey + '-' + jpgSplit[jpgSplit.length - 1]]: modifedImagePromise
					}
				}, {})
				return {
					...mm,
					...modifiedJpgs
				}
			} else {
				return mm
			}
		}, {})
	},

	updateBlogImagePaths: (blogEntries, jpgs, gifs) => {
		return blogEntries.map((blogEntry) => {
			const blogEntryHtmlString = blogEntry.markdownContent

			const $ = cheerio.load(blogEntryHtmlString)

			Object.keys(jpgs).forEach((jpg) => {
				const split = jpg.split('/')
				$(':root')
					.find(`img[src="${split[split.length -1]}"]`)
					.replaceWith(cheerio(`<img src=${'/' + jpg}></img>`))
			})

			Object.keys(gifs).forEach((gif) => {
				const split = gif.split('/')
				$(':root')
					.find(`img[src="${split[split.length -1]}"]`)
					.replaceWith(cheerio(`<img src=${'/' + gif}></img>`))
			})
			return {
				...blogEntry,
				markdownContent: $.html()
			}
		})

	},

	jadeRender: (content, pageLayout, locals) => {
		return jade.render(content, {
			filename: pageLayout.src,
			...locals
		})
	},

	jadeRenderPageLayout: (content, pageLayout, locals) => {
		return jade.render(pageLayout.content, {
			filename: pageLayout.src,
			page: {
				content: content
			},
			...locals
		})
	},

	jadeRenderBlogEntry: (blogEntry, blogEntryLayout, locals) => {
		return jade.render(blogEntryLayout.content, {
			filename: blogEntryLayout.src,
			entry: blogEntry,
			page: {
				content: blogEntry.markdownContent,
			},
			...locals
		})
	}


}
