// you need to import reselect's createSelector function in order to perform memoized loigc
createSelector = require('reselect').createSelector;

// import anything! you want to use in your selectors, provided they are *purely functional*
CleanCSS = require('clean-css');
fs = require('fs');
jade = require("jade");
markdown = require('marky-mark');
markdownpdf = require("markdown-pdf");
moment = require('moment');
slug = require('slug');
lwip = require("js-lwip");
cheerio = require("cheerio");

const {
  contentOfFile,
  contentsOfFiles,
  srcAndContentOfFile,
  srcAndContentOfFiles
} = require("./webcrackHelpers.js");

const LICENSE = 'LICENSE';
const RESUME = 'RESUME';
const CSS = 'CSS';
const PAGES = 'PAGES';
const BLOG_ENTRIES = 'BLOG_ENTRIES'
const VIEWS = 'VIEWS'
const BLOG_ENTRIES_JPGS = 'BLOG_ENTRIES_JPGS'
const NOT_FOUND_PAGE = 'NOT_FOUND_PAGE'
const BLOG_ASSETS = 'BLOG_ASSETS'

module.exports = {
  initialState: {},

  options: {
    inFolder: 'src',
    outFolder: 'dist'
  },

  encodings: {
    'utf8': ['md', 'css', 'jade', 'txt', 'json'],
    '': ['jpg']
  },

  // defines the inputs points where files will be read and their key within the Redux store
  inputs: {
    [LICENSE]: 'LICENSE.txt',
    [RESUME]: 'resume.md',
    [CSS]: 'assets/*.css',
    [PAGES]: 'pages/**/*.jade',
    [BLOG_ENTRIES]: 'blogEntries/**/index.md',
    [VIEWS]: 'views/*.jade',
    [BLOG_ENTRIES_JPGS]: 'blogEntries/**/*.jpg',
    [NOT_FOUND_PAGE]: '404.jade',
    [BLOG_ASSETS]: 'blogEntries/**/assets.json',
  },

  // defines the output points based on a base selector which is subscribed to changes in the redux state
  // `selectors` are keyed on your inputs for easier momization
  // must return a function of state, which returns a hash
  outputs: (selectors) => {

    const packageSelector = createSelector(() => {
      return require("./package.json")
    });

    const resumeSelector = contentOfFile(selectors[RESUME])
    const licenseSelector = contentOfFile(selectors[LICENSE])
    const pageJadeSelector = srcAndContentOfFile(selectors[VIEWS], './src/views/page.jade')
    const blogEntryJadeLayout = srcAndContentOfFile(selectors[VIEWS], './src/views/blogEntryLayout.jade')
    const notFoundSelector = contentOfFile(selectors[NOT_FOUND_PAGE])
    const styleSelector = contentsOfFiles(selectors[CSS])
    const blogEntriesSrcAndContents = srcAndContentOfFiles(selectors[BLOG_ENTRIES]);
    const pagesSrcAndContents = srcAndContentOfFiles(selectors[PAGES]);
    const blogEntriesAssetsSrcAndContents = srcAndContentOfFiles(selectors[BLOG_ASSETS]);

    const blogEntriesAssetsSrcAndJson = createSelector([blogEntriesAssetsSrcAndContents], (assets) => {
      return assets.map((asset) => {
        return {
          src: asset.src,
          json: JSON.parse(asset.content)
        }
      })
    })

    const resumePDFSelector = createSelector([resumeSelector], (resume) => {
      return markdownpdf({}).from.string(resume).to.buffer
    })

    const blogEntriesSelector = createSelector(blogEntriesSrcAndContents, (blogEntries) => {
      return blogEntries.map((blogEntry) => {
        const markdownContent = markdown.parse(blogEntry.content)
        const slugPath = "blog/" + blogEntry.src.split('/')[3] + '-' + (slug(markdownContent.meta.title)) + "/"
        const filePath = slugPath + 'index.html';
        return {
          meta: markdownContent.meta,
          markdownContent: markdownContent.content,
          dest: filePath,
          url: `/${filePath}`,
          destFolder: slugPath,
          srcFolder: blogEntry.src.split('index.md')[0]
        }
      }).sort((b, a) => {
        return moment(a.meta.publishedAt).diff(moment(b.meta.publishedAt))
      })
    });

    const pagesSelector = createSelector(pagesSrcAndContents, (pages) => {
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
    });

    const cssOutput = createSelector(styleSelector, (css) =>
      new CleanCSS({
        keepSpecialComments: 2
      }).minify(
        fs.readFileSync('./node_modules/normalize.css/normalize.css', 'utf8') + css
      ).styles);

    const blogEntriesJpgsOrginalOutput = createSelector([
      srcAndContentOfFiles(selectors[BLOG_ENTRIES_JPGS]),
      blogEntriesSelector
    ], (jpgs, blogEntries) => {
      return jpgs.reduce((mm, jpg) => {
        const src = jpg.src
        const jpgSplit = src.split('/')
        return {
          ...mm,
          [blogEntries.find((b) => src.includes(b.srcFolder)).destFolder + jpgSplit[jpgSplit.length - 1]]: jpg.content
        }
      }, {})
    });


    const blogEntriesJpgsModifiedOutput = createSelector([
      srcAndContentOfFiles(selectors[BLOG_ENTRIES_JPGS]),
      blogEntriesAssetsSrcAndJson,
      blogEntriesSelector
    ], (jpgs, assets, blogEntries) => {
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
              return lwip.open(jpg.content, 'jpg', function(err, image) {

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
    });

    const blogEntriesJpgsSelector = createSelector([
      blogEntriesJpgsOrginalOutput,
      blogEntriesJpgsModifiedOutput
    ], (originals, modifed) => {
      return {
        ...originals,
        ...modifed
      }
    })

    const blogEntriesSelectorWithUpdatedImageLinks = createSelector([blogEntriesSelector, blogEntriesJpgsSelector], (blogEntries, jpgs) => {
      return blogEntries.map((blogEntry) => {
        const blogEntryHtmlString = blogEntry.markdownContent

        const $ = cheerio.load(blogEntryHtmlString)

        Object.keys(jpgs).forEach((jpg) => {
          const split = jpg.split('/')
          $(':root')
          .find(`img[src="${split[split.length -1]}"]`)
          .replaceWith(cheerio(`<img src=${'/' + jpg}></img>`))
        })
        return {
          ...blogEntry,
          markdownContent: $.html()
        }
      })
    })

    const htmlSelector = createSelector([
      packageSelector,
      pagesSelector,
      blogEntriesSelectorWithUpdatedImageLinks,
      createSelector(resumeSelector, (resume) => markdown.parse(resume)),
      pageJadeSelector,
      blogEntryJadeLayout,
      notFoundSelector,
    ], (package, pages, blogEntries, markdownResume, pageLayout, blogEntryLayout, notFoundContent) => {
      const localsToJadeRender = {
        blogEntries,
        pages,
        package
      }
      const processedPages = pages.reduce((mm, page) => {
        return {
          ...mm,
          [page.dest]: jade.render(page.content, {
            filename: pageLayout.src,
            page,
            ...localsToJadeRender
          })
        }
      }, {});

      const processedBlogEntries = blogEntries.reduce((mm, blogEntry) => {
        return {
          ...mm,
          [blogEntry.dest]: jade.render(blogEntryLayout.content, {
            filename: blogEntryLayout.src,
            entry: blogEntry,
            page: {
              content: blogEntry.markdownContent,
            },
            ...localsToJadeRender
          })
        }
      }, {});

      return {
        ...processedBlogEntries,
        ...processedPages,
        'resume.html': jade.render(pageLayout.content, {
          filename: pageLayout.src,
          page: {
            content: markdownResume.content
          },
          ...localsToJadeRender
        }),
        '404.html': jade.render(notFoundContent, {
          filename: pageLayout.src,
          ...localsToJadeRender
        })
      }
    });

    // return a hash objects based on the state.
    //Each key is a file and each value is the contents of that file
    return createSelector([
      licenseSelector,
      resumeSelector,
      resumePDFSelector,
      cssOutput,
      htmlSelector,
      blogEntriesJpgsOrginalOutput,
      blogEntriesJpgsModifiedOutput,
    ], (license, resumeMd, resumePdf, style, html, blogJpegsOriginal, blogJpegsMod) => {
      return {
        'LICENSE.txt': license,
        'resume.md': resumeMd,
        'style.css': style,
        'resume.pdf': resumePdf,
        ...html,
        ...blogJpegsOriginal,
        ...blogJpegsMod
      }
    });
  }
}
