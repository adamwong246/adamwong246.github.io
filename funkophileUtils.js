cheerio = require("cheerio");
CleanCSS = require('clean-css');
fs = require('fs');
jade = require("jade");
lwip = require("js-lwip");
moment = require('moment');
puppeteer = require('puppeteer');
simpleIcons = require('simple-icons');
slug = require('slug');

module.exports = {

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

	// makeResumePdf: (resumeMarkdown, css, pdfSettings) => {
	// 	return (async () => {
	// 		try {
	// 			const browser = await puppeteer.launch();
	// 			const page = await browser.newPage();
	// 			await page.setContent(resumeMarkdown.content)
	// 			await page.addStyleTag({
	// 				content: css
	// 			})
	// 			const pdf = await page.pdf({
	// 				path: '/dev/null',
  //         ...JSON.parse(pdfSettings)
	// 			});
	// 			await browser.close();
  //
	// 			// clear the timestamp for deterministic pdfs
	// 			for (const offset of [97, 98, 99, 100, 132, 133, 134, 135]) {
	// 				pdf[offset] = 0;
	// 			}
	// 			return pdf
	// 		} catch (e) {
	// 			console.error(e);
	// 			return e;
	// 		} finally {
	// 			// console.log('We do cleanup here');
	// 		}
  //
	// 	})();
	// },

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
