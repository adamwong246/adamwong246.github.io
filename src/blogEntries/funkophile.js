const $$$ = require('reselect').createSelector;
const lwip = require("@randy.tarampi/lwip");
markdown = require('marky-mark');
slug = require('slug');
moment = require('moment');
cheerio = require("cheerio");
simpleIcons = require('simple-icons');

const {
  contentOfFile,
  contentsOfFiles,
  srcAndContentOfFile,
  srcAndContentOfFiles
} = require("../../funkophile/funkophileHelpers.js");


// One key for every file input pattern
const BLOG_ASSETS = 'BLOG_ASSETS'
const BLOG_ENTRIES = 'BLOG_ENTRIES'
const BLOG_ENTRIES_JPGS = 'BLOG_ENTRIES_JPGS'
const BLOG_ENTRIES_GIFS = 'BLOG_ENTRIES_GIFS'
const BLOG_ENTRIES_MOVS = 'BLOG_ENTRIES_MOVS'
const BLOG_ENTRIES_PNGS = 'BLOG_ENTRIES_PNGS'

const BLOG_ENTRIES_RAW = 'BLOG_ENTRIES_RAW'

const transformJpegs = (jpgs, assets, blogEntries) => {
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
};

const updateBlogImagePaths = (blogEntries, jpgs, gifs, movs, pngs, rawAssets) => {
  return blogEntries.map((blogEntry) => {
    const blogEntryHtmlString = blogEntry.markdownContent;
    const $ = cheerio.load(blogEntryHtmlString);

    [
      ...Object.keys(jpgs),
      ...Object.keys(gifs),
      ...Object.keys(pngs),
      ...Object.keys(rawAssets)
    ].forEach((key) => {
      const split = key.split('/');
      const last = split[split.length - 1];

      $(':root')
        .find(`img[src="${last}"]`)
        .attr("src", `/${key}`)

      $(':root')
        .find(`a[href="${last}"]`)
        .attr("href", `/${key}`)
    });

    return {
      ...blogEntry,
      markdownContent: $.html(),
      // images: {jpgs, gifs, movs}
    };
  });

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
    .filter((a) => a.meta.published !== false)
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
    [BLOG_ENTRIES_PNGS]: 'blogEntries/**/*.png',
    [BLOG_ENTRIES]: 'blogEntries/**/index.md',

    [BLOG_ENTRIES_RAW]: 'blogEntries/**/raw/*'
  },

  // return a selector based on the given selector '_'
  outputs: (_) => {

    const $blogEntries = $$$(
      srcAndContentOfFiles(_[BLOG_ENTRIES]),
      processBlogEntries
    );


    //   const $blogEntriesRaw = $$$([srcAndContentOfFiles(_[BLOG_ENTRIES_RAW]), $blogEntries],
    //   (gifs, blogEntries) => gifs.reduce((mm, gif) => {
    //     const src = gif.src
    //     const gifSplit = src.split('/')
    //     return {
    //       ...mm,
    //       [blogEntries.find((b) => src.includes(b.srcFolder)).destFolder + gifSplit[gifSplit.length - 1]]: gif.content
    //     }
    //   }, {})
    // );

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

    const $blogEntriesPngs = $$$([srcAndContentOfFiles(_[BLOG_ENTRIES_PNGS]), $blogEntries],
      (pngs, blogEntries) => pngs.reduce((mm, png) => {
        const src = png.src
        const pngSplit = src.split('/')
        return {
          ...mm,
          [blogEntries.find((b) => src.includes(b.srcFolder)).destFolder + pngSplit[pngSplit.length - 1]]: png.content
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


    const $blogEntriesRaw = $$$([srcAndContentOfFiles(_[BLOG_ENTRIES_RAW]), $blogEntries],
      (rawAssets, blogEntries) => rawAssets.reduce((mm, raw) => {
        const src = raw.src;
        const rawSplit = src.split('/');
        return {
          ...mm,
          [blogEntries.find((b) => src.includes(b.srcFolder)).destFolder + rawSplit[rawSplit.length - 1]]: raw.content
        }
      }, {})
    );

    return {
      $allBlogAssets: $$$([
        $blogEntriesGifs, $blogEntriesMovs, $blogEntriesJpgsOrginal, $blogEntriesJpgsModified, $blogEntriesPngs, $blogEntriesRaw
      ], (gifs, movs, jpgOrginals, jpgModifieds, pngs, rawAssets) => {
        return {
          ...gifs,
          ...jpgModifieds,
          ...jpgOrginals,
          ...movs,
          ...pngs,
          ...rawAssets,
        }
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
        $blogEntriesMovs,
        $blogEntriesPngs,
        $blogEntriesRaw
      ], updateBlogImagePaths)
    }

  }
}