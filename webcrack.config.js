createSelector = require('reselect').createSelector;

// import anything! you want to use in your selectors, provided they are *purely functional*
CleanCSS = require('clean-css');
jade = require("jade");
moment = require('moment');
markdown = require('marky-mark');
slug = require('slug');
fs = require('fs');

module.exports = {
  initialState: {
    views: {},
    pages: [],
    blogEntries: [],
    css: [],
    license: "",
    resume: "",
    // moment: moment
  },

  options: {
    inFolder: 'src',
    outFolder: 'dist'
  },

  // defines the inputs points where files will be read
  inputs: {
    license: {
      filePicker: {
        fileGlob: 'LICENSE.txt'
      },
      mutater: (state, payload) => payload.contents
    },
    css: {
      filePicker: {
        filePath: 'assets',
        fileGlob: '*.css',
      },
      mutater: (state, payload) => [...state.css, payload.contents]
    },
    pages: {
      filePicker: {
        filePath: 'pages',
        fileGlob: '**/*.jade'
      },
      mutater: (state, payload) => [...state.pages, {
        [payload.src]: payload.contents
      }]
    },
    blogEntries: {
      filePicker: {
        filePath: 'blogEntries',
        fileGlob: '**/index.md'
      },
      mutater: (state, payload) => [...state.blogEntries, {
        [payload.src]: payload.contents
      }]
    },
    views: {
      filePicker: {
        filePath: 'views',
        fileGlob: '*.jade'
      },
      mutater: (state, payload) => {
        return {
          ...state.views,
          ...{
            [payload.src]: payload.contents
          }
        }
      }
    },
    resume: {
      filePicker: {
        fileGlob: 'resume.md'
      },
      mutater: (state, payload) => payload.contents
    },
  },

  // defines the output points based on a base selector which is subscribed to changes in the redux state
  outputs: (webcrackStateSelector) => {

    // define the selectors you will pass to outpoint points
    // this includes the intermediate selectors and the output selectors
    // output selectors must return an object of {content: string, path: string}
    // but intermediate selectors do not

    ///////////////////////////////////////////////////////////////////////////

    const packageSelector = createSelector(webcrackStateSelector, (webcrackState) => {
      return require("./package.json")
    });

    const pagesSelector = createSelector(webcrackStateSelector, (webcrackState) => {
      const pages = webcrackState.pages;

      return pages.map((page) => {
        const src = Object.keys(page)[0]
        const baseFileName = src.split('.')[1].split('/').slice(-1)[0];

        let dest, url;

        if (baseFileName !== 'index') {
          dest = `${baseFileName}/index.html`
          url = `/${baseFileName}/index.html`
        } else {
          dest = `index.html`
          url = `/index.html`
        }
        return {
          src,
          content: page[src],
          dest: dest,
          url: url,
          title: baseFileName
        }
      })
    });

    const blogEntriesSelector = createSelector(webcrackStateSelector, (webcrackState) => {
      return webcrackState.blogEntries.map((blogEntry) => {
        const markdownContent = markdown.parse(blogEntry[Object.keys(blogEntry)[0]])
        const filePath = "blog/" + (slug(markdownContent.meta.title)) + '/index.html';
        return {
          ...blogEntry,
          meta: markdownContent.meta,
          markdownContent: markdownContent.content,
          dest: filePath,
        }
      })
    });

    const viewsSelector = createSelector(webcrackStateSelector, (webcrackState) => webcrackState.views)

    const pageLayoutSelector = createSelector(viewsSelector, (views) => {
      const key = './src/views/page.jade'
      return {
        src: key,
        content: views[key]
      }
    })

    const mardkdownResumeSelector = createSelector((webcrackStateSelector), (webcrackState) => {
      return markdown.parse(webcrackState.resume)
    })


    ///////////////////////////////////////////////////////////////////////////

    // Lastly, return the output points and the selectors which feed them
    return {

      //  a debugging selector will write a json file of the state on every change
      webcrackstate: createSelector([webcrackStateSelector], (webcrackState) => [{
        filepath: 'webcrackState.json',
        contents: JSON.stringify(webcrackState, null, 1)
      }]),

      // a selector does not need inputs, but it will execute only once and never refresh
      readme: createSelector([], () => [{
        filepath: 'README',
        contents: "made with webcrack"
      }]),

      // simply copies the file
      license: createSelector([webcrackStateSelector], (webcrackState) => [{
        filepath: 'LICENSE.txt',
        contents: webcrackState.license
      }]),



      // concats and cleans the css while injecting a css file from a node_module
      cssFile: createSelector(webcrackStateSelector, (webcrackState) => {
        return [{
          filepath: 'style.css',
          contents: new CleanCSS({
              keepSpecialComments: 0
            })
            .minify(
              [
                ...webcrackState.css,
                fs.readFileSync('./node_modules/normalize.css/normalize.css', 'utf8')
              ].join('\n')
            ).styles
        }]
      }),

      htmlFiles: createSelector([
        packageSelector,
        pagesSelector,
        blogEntriesSelector,
        mardkdownResumeSelector,
        pageLayoutSelector,
      ], (package, pages, blogEntries, markdownResume, pageLayout) => {
        const localsToJadeRender = {
          blogEntries,
          pages,
          package
        }

        return [
          ...blogEntries.map((blogEntry) => {
            return {
              filepath: blogEntry.dest,
              contents: jade.render(pageLayout.content, {
                filename: pageLayout.src,
                page: {
                  content: blogEntry.markdownContent,
                },
                ...localsToJadeRender
              })
            };
          }),
          ...pages.map((page) => {
            return {
              filepath: page.dest,
              contents: jade.render(page.content, {
                filename: pageLayout.src,
                ...localsToJadeRender
              })
            };
          }),
          {
            filepath: 'resume.html',
            contents: jade.render(pageLayout.contents, {
              filename: pageLayout.src,
              page: {
                content: markdownResume.content
              },
              ...localsToJadeRender
            })
          }
        ]
      }),
    }
  }
}
