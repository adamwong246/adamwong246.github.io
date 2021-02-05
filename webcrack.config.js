// you need to import reselect's createSelector function in order to perform memoized logic
createSelector = require('reselect').createSelector;

// import anything! you want to use in your selectors, provided they are *purely functional*
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
truncateHtml = require('truncate-html')

const {
  contentOfFile,
  contentsOfFiles,
  srcAndContentOfFile,
  srcAndContentOfFiles
} = require("./webcrack/webcrackHelpers.js");

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

  options: {
    inFolder: 'src',
    outFolder: 'dist'
  },

  encodings: {
    'utf8': ['md', 'css', 'jade', 'txt', 'json', 'js'],
    '': ['jpg', 'png', 'gif']
  },

  // defines the inputs points where files will be read and their key within the Redux store
  inputs: {
    [BLOG_ASSETS]: 'blogEntries/**/assets.json',
    [BLOG_ENTRIES_JPGS]: 'blogEntries/**/*.jpg',
    [BLOG_ENTRIES_GIFS]: 'blogEntries/**/*.gif',
    [BLOG_ENTRIES]: 'blogEntries/**/index.md',
    [CONTACTS]: 'contacts.json',
    [CSS]: 'stylesheets/*.css',
    [JPG]: 'images/*.jpg',
    [JPG_TRANSFORMS]: 'images/assets.json',
    [LICENSE]: 'LICENSE.txt',
    [NOT_FOUND_PAGE]: '404.jade',
    [PAGES]: 'pages/**/*.jade',
    [RESUME]: 'resume.md',
    [VIEWS]: 'views/*.jade',
    [FAVICON_PNG]: 'images/evilShroom.png',
    [JS]: 'index.js',
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

    const imageAssetsSrcAndContents = contentOfFile(selectors[JPG_TRANSFORMS]);

    const contactSelector = createSelector(contentOfFile(selectors[CONTACTS]), (contactsString) =>{
      const contectJson = JSON.parse(contactsString)
      return contectJson.map((c) => {
        return {
          'type': Object.keys(c)[0],
          'content': c[Object.keys(c)[0]],
          'icon': simpleIcons.get(Object.keys(c)[0]).svg
        }
      })
    })

    const blogEntriesAssetsSrcAndJson = createSelector([blogEntriesAssetsSrcAndContents], (assets) => {
      return assets.map((asset) => {
        return {
          src: asset.src,
          json: JSON.parse(asset.content)
        }
      })
    })

    const blogEntriesSelector = createSelector(blogEntriesSrcAndContents, (blogEntries) => {
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
      }).sort((b, a) => {
        return moment(a.meta.publishedAt).diff(moment(b.meta.publishedAt))
      }).map((lmnt, ndx, ry) => {


        if (ndx === ry.length-1){
          lmnt.meta.previous = null;
        } else {
          const previous = ry[ndx+1];
          lmnt.meta.previous = {
            url: previous.url,
            title: previous.meta.title,
          };
        }

        if (ndx === 0){
          lmnt.meta.next = null;
        } else {
          const next = ry[ndx-1];
          lmnt.meta.next = {
            url: next.url,
            title: next.meta.title,
          };
        }

        return lmnt
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

    const cssOutputSelectors = createSelector(styleSelector, (css) =>
      new CleanCSS({
        keepSpecialComments: 2
      }).minify(
        fs.readFileSync('./node_modules/normalize.css/normalize.css', 'utf8') + css
      ).styles);

    const blogEntriesGifsOutput = createSelector([
      srcAndContentOfFiles(selectors[BLOG_ENTRIES_GIFS]),
      blogEntriesSelector
    ], (gifs, blogEntries) => {
      return gifs.reduce((mm, gif) => {
        const src = gif.src
        const gifSplit = src.split('/')
        return {
          ...mm,
          [blogEntries.find((b) => src.includes(b.srcFolder)).destFolder + gifSplit[gifSplit.length - 1]]: gif.content
        }
      }, {})
    });

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

    const blogEntriesSelectorWithUpdatedImageLinks = createSelector([
      blogEntriesSelector, blogEntriesJpgsSelector, blogEntriesGifsOutput
    ], (blogEntries, jpgs, gifs) => {
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
    })

    const resumeMarkdownSelector = createSelector(resumeSelector, (resume) => markdown.parse(resume))

    const htmlSelector = createSelector([
      packageSelector,
      pagesSelector,
      blogEntriesSelectorWithUpdatedImageLinks,
      resumeMarkdownSelector,
      pageJadeSelector,
      blogEntryJadeLayout,
      notFoundSelector,
      contactSelector,
    ], (package, pages, blogEntries, markdownResume, pageLayout, blogEntryLayout, notFoundContent, contacts) => {
      const localsToJadeRender = {
        blogEntries,
        pages,
        package,
        contacts
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

    const resumePDFSelector = createSelector(
      [resumeMarkdownSelector, cssOutputSelectors],
      (resumeMarkdown, css) => {
      return (async () => {
        try {
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          await page.setContent(resumeMarkdown.content)
          await page.addStyleTag({content: css})
          const pdf = await page.pdf({
            path: '/dev/null',
            format: 'A4', printBackground: false,
            margin: {
              top: '0.5in',
              right: '0.5in',
              bottom: '0.5in',
              left: '0.5in',
            }
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
    })

    const imageAssetsOriginalSelector = createSelector(selectors.JPG, imageAssetsSrcAndContents, (jpgs, assets) => {
      const transformationManifest = JSON.parse(assets)

      return Object.keys(jpgs).reduce((mm, jKey) => {
        const shortFileName = jKey.split('/')[3]
        mm[jKey.split('/').slice(-2).join('/')] = jpgs[jKey]
        const transformations = transformationManifest[shortFileName]
        if (transformations){
          const modifiedJpgs = Object.keys(transformations).reduce((mmm, transformationKey) => {
            const transformation = transformations[transformationKey]

            const modifedImagePromise = new Promise((res, rej) => {
              return lwip.open(jpgs[jKey], 'jpg', function(err, image) {
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



            const jpgSplit = jKey
            mm['images/' + transformationKey + '-' + shortFileName] = modifedImagePromise

          }, {})


        }

        return mm;
      }, {})
    })

    const faviconSelector = createSelector(contentOfFile(selectors[FAVICON_PNG]), (favicon) => {
      return favicon
    })

    const clientJsSelector = createSelector(contentOfFile(selectors[JS]), (js) => {
      return js
    })

    // return a hash objects based on the state.
    // Each key is a file and each value is the contents of that file
    const siteSelector = createSelector([
      licenseSelector,
      resumeSelector,
      resumePDFSelector,
      cssOutputSelectors,
      htmlSelector,
      blogEntriesJpgsOrginalOutput,
      blogEntriesJpgsModifiedOutput,
      blogEntriesGifsOutput,
      imageAssetsOriginalSelector,
      faviconSelector,
      clientJsSelector
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
        'README.md': fs.readFileSync('./README.md', 'utf8'),
        'LICENSE.txt': license,
        'resume.md': resumeMd,
        'style.css': style,
        'resume.pdf': resumePdf,
        ...html,
        ...blogJpegsOriginal,
        ...blogJpegsMod,
        ...gifs,
        ...jpgs,
        'favicon.png': favicon,
        'index.js': js
      }
    });

    const siteAndMapSelector = createSelector([siteSelector], (site) => {
      return {
        ...site,
        'sitemap.html': `<ul>${Object.keys(site).sort((e)=>e).map((e)=> `<li><a href="/${e}"> ${e} </a></li>`).join('')}</ul>`
      }
    })

    return siteAndMapSelector;
  }
}
