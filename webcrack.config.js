// you need to import reselect's createSelector function in order to perform memoized loigc
createSelector = require('reselect').createSelector;

// import anything! you want to use in your selectors, provided they are *purely functional*
CleanCSS = require('clean-css');
fs = require('fs');
jade = require("jade");
markdown = require('marky-mark');
markdownpdf = require("markdown-pdf")
moment = require('moment');
slug = require('slug');

module.exports = {
  initialState: {},

  options: {
    inFolder: 'src',
    outFolder: 'dist'
  },

  encodings: {
    'utf8': ['md', 'css', 'jade', 'txt'],
    '': ['jpg']
  },

  // defines the inputs points where files will be read
  // and a mutator of redux state
  inputs: {
    license: 'LICENSE.txt',
    resume: 'resume.md',
    css: 'assets/*.css',
    pages: 'pages/**/*.jade',
    blogEntries: 'blogEntries/**/index.md',
    views: 'views/*.jade',
    blogEntriesJpgs: 'blogEntries/**/*.jpg',
    notFoundPage: '404.jade'
  },

  // defines the output points based on a base selector which is subscribed to changes in the redux state
  // `selectors` are keyed on your inputs for easier momization
  // must return a function of state, which returns a hash
  outputs: (selectors) => {

    const resumeSelector = createSelector([selectors.resume], (resumeState) => {
      return Object.keys(resumeState).reduce((mm, k) => resumeState[k], {})
    })

    const licenseSelector = createSelector([selectors.license], (license) => {
      return Object.keys(license).reduce((mm, k) => license[k], {})
    })

    const styleSelector = createSelector([selectors.css], (css) => {
      return Object.keys(css).reduce((mm, k) => mm + css[k], '')
    })

    const resumePDFSelector = createSelector([resumeSelector], (resume) => {
      return markdownpdf({}).from.string(resume).to.buffer
    })

    const blogEntriesSelector = createSelector([selectors.blogEntries], (blogEntries) => {
      const keys = Object.keys(blogEntries)
      return keys.map((key) => {
        const markdownContent = markdown.parse(blogEntries[key])
        const slugPath = "blog/" + key.split('/')[3] + '-' +(slug(markdownContent.meta.title)) + "/"
        const filePath = slugPath + 'index.html';
        return {
          meta: markdownContent.meta,
          markdownContent: markdownContent.content,
          dest: filePath,
          url: `/${filePath}`,
          destFolder: slugPath,
          srcFolder: key.split('index.md')[0]
        }
      }).sort((b, a) => {
        return moment(a.meta.publishedAt).diff(moment(b.meta.publishedAt))
      })
    });


    const pageJadeSelector = createSelector(selectors.views, (views) => {
      const key = './src/views/page.jade'
      return {
        src: key,
        content: views[key]
      }
    });

    const packageSelector = createSelector(() => {
      return require("./package.json")
    });

    const notFoundSelector = createSelector([selectors.notFoundPage], (notfoundPage) => {
      return Object.keys(notfoundPage).reduce((mm, k) => notfoundPage[k], {});
    })

    const htmlSelector = createSelector([
      packageSelector,
      createSelector([selectors.pages], (pages) => {
        const keys = Object.keys(pages)
        return keys.map((key) => {
          const page = pages[key]
          const baseFileName = key.split('.')[1].split('/').slice(-1)[0];

          let dest, url;

          if (baseFileName !== 'index') {
            dest = `${baseFileName}/index.html`
            url = `/${baseFileName}/index.html`
          } else {
            dest = `index.html`
            url = `/index.html`
          }
          return {
            key,
            content: page,
            dest: dest,
            url: url,
            title: baseFileName
          }
        })
      }),
      blogEntriesSelector,
      createSelector(resumeSelector, (resume) => markdown.parse(resume)),
      pageJadeSelector,
      createSelector(selectors.views, (views) => {
        const key = './src/views/blogEntryLayout.jade'
        return {
          src: key,
          content: views[key]
        }
      }),
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
        'resume.html': jade.render(pageLayout.contents, {
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



    const blogEntriesJpgsOutput = createSelector([selectors.blogEntriesJpgs, blogEntriesSelector], (jpgs, blogEntries) => {
      return Object.keys(jpgs).reduce((mm, jpgkey) => {
        const src = jpgkey
        const contents = jpgs[jpgkey];
        const jpgSplit = src.split('/')
        return {
          ...mm,
          [blogEntries.find((b) => src.includes(b.srcFolder)).destFolder + jpgSplit[jpgSplit.length - 1]]: contents
        }
      }, {})
    });

    const cssOutput = createSelector(styleSelector, (css) => {
      return new CleanCSS({
        keepSpecialComments: 0
      }).minify(
        [
          fs.readFileSync('./node_modules/normalize.css/normalize.css', 'utf8'),
          css
        ].join('\n')
      ).styles
    });



    // return a hash objects based on the state.
    //Each key is a file and each value is the contents of that file
    return createSelector([
      licenseSelector,
      resumeSelector,
      resumePDFSelector,
      cssOutput,
      htmlSelector,
      blogEntriesJpgsOutput,
    ], (license, resumeMd, resumePdf, style, html, blogJpegs) => {

      return {
        'LICENSE.txt': license,
        'resume.md': resumeMd,
        'style.css': style,
        'resume.pdf': resumePdf,
        ...html,
        ...blogJpegs,
      }
    });
  }
}
