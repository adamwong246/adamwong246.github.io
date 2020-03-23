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
  initialState: {
    views: {},
    pages: {},
    blogEntries: {},
    css: "",
    resume: "",
    license: ""
    // moment: moment
  },

  options: {
    inFolder: 'src',
    outFolder: 'dist'
  },

  // defines the inputs points where files will be read
  // and a mutator of redux state
  inputs: {
    license: {
      'LICENSE.txt': (license, payload) => payload.contents
    },
    resume: {
      'resume.md': (state, payload) => payload.contents
    },
    css: {
      'assets/*.css': (css, payload) => payload.contents
    },

    pages: {
      'pages/**/*.jade': (pages, payload) => {
        return {
          ...pages,
          ...{
            [payload.src]: payload.contents
          }
        }
      }
    },
    blogEntries: {
      'blogEntries/**/index.md': (blogEntries, payload) => {
        return {
          ...blogEntries,
          ...{
            [payload.src]: payload.contents
          }
        }
      }
    },
    views: {
      'views/*.jade': (views, payload) => {
        return {
          ...views,
          ...{
            [payload.src]: payload.contents
          }
        }
      }
    },

  },

  // defines the output points based on a base selector which is subscribed to changes in the redux state
  outputs: (reduxState) => {

    // Lastly, return the output points and the selectors which feed them
    // each item needs to return an array of objects
    // where the `key` is a file and the `value` is the file contents
    return {
      // a selector does not need inputs, but it will execute only once and never refresh
      readme: createSelector([], () => {
        return {'README': "made with webcrack"}
      }),

      //  a debugging selector will write a json file of the state on every change
      webcrackstate: createSelector([reduxState], (state) => {
        return {'state.json': JSON.stringify(state, null, 1)}
      }),

      // simply copies the file
      license: createSelector([reduxState], (state) => {
        return  {'LICENSE.txt': state.license}
      }),

      resumeMd: createSelector([reduxState], (state) => {
        return {
          'resume.md': state.resume
        }
      }),

      cssFile: createSelector(reduxState, (state) => {
        return {
          'style.css': new CleanCSS({
            keepSpecialComments: 0
          }).minify(
            [
              state.css,
              fs.readFileSync('./node_modules/normalize.css/normalize.css', 'utf8')
            ].join('\n')
          ).styles
        }
      }),

      htmlFiles: createSelector([
        createSelector(reduxState, (state) => {
          return require("./package.json")
        }),
        createSelector(reduxState, (state) => {

          const pages = state.pages;
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
        createSelector(reduxState, (state) => {
          const keys = Object.keys(state.blogEntries)
          return keys.map((key) => {
            const blogEntry = state.blogEntries[key]
            const markdownContent = markdown.parse(blogEntry)
            const filePath = "blog/" + (slug(markdownContent.meta.title)) + '/index.html';
            return {
              ...blogEntry,
              meta: markdownContent.meta,
              markdownContent: markdownContent.content,
              dest: filePath,
              url: `/${filePath}`,
            }
          })
        }),
        createSelector((reduxState), (state) => markdown.parse(state.resume)),
        createSelector(createSelector(reduxState, (state) => state.views), (views) => {
          const key = './src/views/page.jade'
          return {
            src: key,
            content: views[key]
          }
        }),
        createSelector(createSelector(reduxState, (state) => state.views), (views) => {
          const key = './src/views/blogEntryLayout.jade'
          return {
            src: key,
            content: views[key]
          }
        })
      ], (package, pages, blogEntries, markdownResume, pageLayout, blogEntryLayout) => {
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
        },{});

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
        },{});

        return {
          ...processedBlogEntries,
          ...processedPages,
          'resume.html': jade.render(pageLayout.contents, {
            filename: pageLayout.src,
            page: {
              content: markdownResume.content
            },
            ...localsToJadeRender
          })
        }
      }),

      // resumePdf: createSelector([reduxState], (state) => {
      //   return {
      //     'resume.pdf': markdownpdf().from.string(state.resume).to.buffer
      //   };
      // }),

    }
  }
}
