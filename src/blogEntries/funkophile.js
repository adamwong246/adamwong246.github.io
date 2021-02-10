const $$$ = require('reselect').createSelector;
markdown = require('marky-mark');

const {
	contentOfFile,
	contentsOfFiles,
	srcAndContentOfFile,
	srcAndContentOfFiles
} = require("../../funkophile/funkophileHelpers.js");

const {
	transformJpegs,
} = require("../../funkophileUtils.js");

// One key for every file input pattern
const BLOG_ASSETS = 'BLOG_ASSETS'
const BLOG_ENTRIES = 'BLOG_ENTRIES'
const BLOG_ENTRIES_JPGS = 'BLOG_ENTRIES_JPGS'
const BLOG_ENTRIES_GIFS = 'BLOG_ENTRIES_GIFS'
const BLOG_ENTRIES_MOVS = 'BLOG_ENTRIES_MOVS'

const updateBlogImagePaths = (blogEntries, jpgs, gifs, movs) => {
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
      markdownContent: $.html(),
      // images: {jpgs, gifs, movs}
    }
  })
};

const processBlogEntries = (blogEntries) => {
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
};

module.exports = {

	// defines the inputs points where files will be read and their key within the Redux store
	inputs: {
		[BLOG_ASSETS]: 'blogEntries/**/assets.json',
		[BLOG_ENTRIES_GIFS]: 'blogEntries/**/*.gif',
		[BLOG_ENTRIES_JPGS]: 'blogEntries/**/*.jpg',
    [BLOG_ENTRIES_MOVS]: 'blogEntries/**/*.mov',
		[BLOG_ENTRIES]: 'blogEntries/**/index.md',
	},

	// return a selector based on the given selector '_'
	outputs: (_) => {

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

		const $blogEntriesMovs = $$$([srcAndContentOfFiles(_[BLOG_ENTRIES_MOVS]), $blogEntries],
			(movs, blogEntries) => movs.reduce((mm, mov) => {
				const src = mov.src
				const movSplit = src.split('/')
				return {
					...mm,
					[blogEntries.find((b) => src.includes(b.srcFolder)).destFolder + movSplit[movSplit.length - 1]]: mov.content
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
		], transformJpegs);


    return {
      $allBlogAssets: $$$([$blogEntriesGifs, $blogEntriesMovs, $blogEntriesJpgsOrginal, $blogEntriesJpgsModified], (gifs, movs, jpgOrginals, jpgModifieds) => {
        return {...gifs, ...movs, ...jpgOrginals, ...jpgModifieds}
      }),

      $blog: $$$([
        $blogEntries, $$$([
          $blogEntriesJpgsOrginal,
          $blogEntriesJpgsModified
        ], (originals, modifed) => {
          return {
            ...originals,
            ...modifed
          }
        }), $blogEntriesGifs,
        $blogEntriesMovs
      ], updateBlogImagePaths)
    }

	}
}
