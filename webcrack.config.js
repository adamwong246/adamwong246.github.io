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
moment = require("moment")

module.exports = {
  initialState: {
    views: {},
    pages: {},
    blogEntries: {},
    blogEntriesJpgs: [],
    css: {},
    resume: "",
    license: ""
  },

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
    license: {
      'LICENSE.txt': (license, payload) => payload.contents
    },
    resume: {
      'resume.md': (state, payload) => payload.contents
    },

    css: {
      'assets/*.css': (csses, payload) => {
        return {
          ...csses,
          ...{
            [payload.src]: payload.contents
          }
        }
      }
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

    blogEntriesJpgs: {
      'blogEntries/**/*.jpg': (blogEntriesJpgs, payload) => {
        return [
          ...blogEntriesJpgs,
          {
            src: payload.src,
            contents: payload.contents
          }
        ]
      }
    },
  },

  // defines the output points based on a base selector which is subscribed to changes in the redux state
  outputs: (reduxState) => {

    const resumeSelector = ([reduxState], (state) => {
      return state.resume
    })

    const blogEntriesSelector = createSelector(reduxState, (state) => {
      const keys = Object.keys(state.blogEntries)
      return keys.map((key) => {
        const blogEntry = state.blogEntries[key]
        const markdownContent = markdown.parse(blogEntry)

        const slugPath = "blog/" + (slug(markdownContent.meta.title)) + "/"
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

    const blogEntriesJpgsSelector = ([reduxState], (state) => {
      return state.blogEntriesJpgs
    })

    const cssSelector = ([reduxState], (state) => {
      return Object.keys(state.css).map((c) => {
        return state.css[c]
      })
    })

    // Lastly, return the output points and the selectors which feed them
    // each item needs to return an array of objects
    // where the `key` is a file and the `value` is the file contents
    return {
      //  a debugging selector will write a json file of the state on every change
      // webcrackstate: createSelector([reduxState], (state) => {
      //   return {'state.json': JSON.stringify(state, null, 1)}
      // }),

      // simply copies the file
      license: createSelector([reduxState], (state) => {
        return  {'LICENSE.txt': state.license}
      }),

      resumeMd: createSelector([resumeSelector], (resume) => {
        return {
          'resume.md': resume
        }
      }),

      cssFile: createSelector(cssSelector, (css) => {
        return {
          'style.css': new CleanCSS({
            keepSpecialComments: 0
          }).minify(
            [
              ...css,
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
        blogEntriesSelector,
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

      resumePdf: createSelector([resumeSelector], (resume) => {
        return {
          'resume.pdf': markdownpdf().from.string(resume).to.buffer
        };
      }),

      blogEntriesJpgs: createSelector([blogEntriesJpgsSelector, blogEntriesSelector], (jpgs, blogEntries) => {
        return jpgs.reduce((mm, jpg) => {
          const jpgSplit = jpg.src.split('/')
          return {
            ...mm,
            [blogEntries.find((b) => jpg.src.includes(b.srcFolder)).destFolder + jpgSplit[jpgSplit.length-1]]: jpg.contents
          }
        },{})

      }),

    }
  }
}
