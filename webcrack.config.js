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
    pages: [],
    blogEntries: [],
    css: [],
    resume: "",
    moment: moment
  },

  options: {
    inFolder: 'src',
    outFolder: 'dist'
  },

  // defines the inputs points where files will be read
  inputs: {
    license: {
      'LICENSE.txt': (state, payload) => payload.contents
    },
    css: {
      'assets/*.css': (state, payload) => [...state.css, payload.contents]
    },
    pages: {
      'pages/**/*.jade': (state, payload) => [...state.pages, {
        [payload.src]: payload.contents
      }]
    },
    blogEntries: {
      'blogEntries/**/index.md': (state, payload) => [...state.blogEntries, {
        [payload.src]: payload.contents
      }]
    },
    views: {
      'views/*.jade': (state, payload) => {
        return {
          ...state.views,
          ...{
            [payload.src]: payload.contents
          }
        }
      }
    },
    resume: {
      'resume.md': (state, payload) => payload.contents
    },
  },

  // defines the output points based on a base selector which is subscribed to changes in the redux state
  outputs: (reduxState) => {

    // define the selectors you will pass to outpoint points
    // this includes the intermediate selectors and the output selectors
    // output selectors must return an object of {content: string, path: string}
    // but intermediate selectors do not

    ///////////////////////////////////////////////////////////////////////////

    const licenseSelectors = createSelector([reduxState], (state) => [{
      'LICENSE.txt': state.license
    }]);

    const packageSelector = createSelector(reduxState, (state) => {
      return require("./package.json")
    });

    const pagesSelector = createSelector(reduxState, (state) => {
      const pages = state.pages;

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

    const blogEntriesSelector = createSelector(reduxState, (state) => {
      return state.blogEntries.map((blogEntry) => {
        const markdownContent = markdown.parse(blogEntry[Object.keys(blogEntry)[0]])
        const filePath = "blog/" + (slug(markdownContent.meta.title)) + '/index.html';
        return {
          ...blogEntry,
          meta: markdownContent.meta,
          markdownContent: markdownContent.content,
          dest: filePath,
          url: `/${filePath}`,
        }
      })
    });

    const viewsSelector = createSelector(reduxState, (state) => state.views)

    const pageLayoutSelector = createSelector(viewsSelector, (views) => {
      const key = './src/views/page.jade'
      return {
        src: key,
        content: views[key]
      }
    })

    // concats and cleans the css while injecting a css file from a node_module
    const cssSelector = createSelector(reduxState, (state) => {
      return [{
        'style.css': new CleanCSS({
          keepSpecialComments: 0
        }).minify(
          [
            ...state.css,
            fs.readFileSync('./node_modules/normalize.css/normalize.css', 'utf8')
          ].join('\n')
        ).styles
      }]
    })

    const resumeSelector = createSelector((reduxState), (state) => markdown.parse(state.resume));

    const htmlSelector = createSelector([
      packageSelector,
      pagesSelector,
      blogEntriesSelector,
      resumeSelector,
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
            [blogEntry.dest]: jade.render(pageLayout.content, {
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
            [page.dest]: jade.render(page.content, {
              filename: pageLayout.src,
              ...localsToJadeRender
            })
          };
        }),
        {
          'resume.html': jade.render(pageLayout.contents, {
            filename: pageLayout.src,
            page: {
              content: markdownResume.content
            },
            ...localsToJadeRender
          })
        }
      ]
    });

    const resumePdfSelector = createSelector([reduxState], (state) => {
      return [{
        'resume.pdf': markdownpdf().from.string(state.resume).to.buffer
      }]
    });
    ///////////////////////////////////////////////////////////////////////////

    // Lastly, return the output points and the selectors which feed them
    // each item needs to return an array of objects
    // where the `key` is a file and the `value` is the file contents
    return {
      // a selector does not need inputs, but it will execute only once and never refresh
      // readme: createSelector([], () => [{
      //   'README': "made with webcrack"
      // }]),

      //  a debugging selector will write a json file of the state on every change
      webcrackstate: createSelector([reduxState], (state) => [{
        'state.json': JSON.stringify(state, null, 1)
      }]),

      // simply copies the file
      license: licenseSelectors,

      cssFile: cssSelector,
      htmlFiles: htmlSelector,
      resumePdf: resumePdfSelector
    }
  }
}
