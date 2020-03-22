createSelector = require('reselect').createSelector;

// import anything! you want to use in your selectors, provided they are *purely functional*
CleanCSS = require('clean-css');
jade = require("jade");
moment = require('moment');
markdown = require('marky-mark');
slug = require('slug');

module.exports = {
  initialState: {
    views: [],
    pages: [],
    blogEntries: [],
    css: [],
    license: [],
    resume: [],
    moment: moment
  },

  options: {
    inFolder: 'src',
    outFolder: 'dist'
  },

  // defines the inputs points where files will be read
  inputs: [
    {
      key: 'license',
      filePicker: 'LICENSE.txt'
    },
    {
      key: 'css',
      filePicker: [
        {
          filepath: 'assets',
          fileglob: '*.css',
        },
        // 'node_modules/normalize.css/normalize.css'
      ]
    },
    {
      key: 'pages',
      filePicker: {
        filepath: 'pages',
        fileglob: '**/*.jade'
      }
    },
    {
      key: 'blogEntries',
      filePicker: {
        filepath: 'blogEntries',
        fileglob: '**/index.md'
      }
    },
    {
      key: 'views',
      filePicker: {
        filepath: 'views',
        fileglob: '*.jade'
      }
    },
    {
      key: 'resume',
      filePicker: {
        filepath: '',
        fileglob: 'resume.md'
      }
    },
  ],

  // defines the output points based on a base selector which is subscribed to changes in the redux state
  outputs: (webcrackStateSelector, options) => {

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
        const baseFileName = page.src.split('.')[1].split('/').slice(-1)[0];

        let dest, url;

        if (baseFileName !== 'index'){
          dest = `${baseFileName}/index.html`
          url = `/${baseFileName}/index.html`
        } else {
          dest = `index.html`
          url = `/index.html`
        }
        return {
          ...page,
          content: page.contents,
          baseFileName,
          dest: dest,
          url: url,
          title: baseFileName
        }
      })
    });


    const blogEntriesSelector = createSelector(webcrackStateSelector, (webcrackState) => {
      return webcrackState.blogEntries.map((blogEntry) => {
        const markdownContent = markdown.parse(blogEntry.contents)

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

    const pageLayoutSelector = createSelector(viewsSelector, (views) => views.find((v) => v.src === './src/views/page.jade'))

    const mardkdownResumeSelector  = createSelector((webcrackStateSelector), (webcrackState) => {
      const resume = webcrackState.resume[0];
      return markdown.parse(resume.contents)
    })

    const htmlFilesSelector = createSelector([
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
            contents: jade.render(pageLayout.contents, {
              filename: pageLayout.src,
              blogEntry,
              page: {
                // url: 'asd',
                content: blogEntry.markdownContent,
              },
              ...localsToJadeRender
            })
          };
        }),
        ...pages.map((page) => {
          return {
            filepath: page.dest,
            contents: jade.render(page.contents, {
              filename: pageLayout.src,
              page,
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
    });



    ///////////////////////////////////////////////////////////////////////////

    // Lastly, return the output points and the selectors which feed them
    return [

      //  a debugging selector will write a json file of the state on every change
      {
        key: 'webcrackstate',
        selector: createSelector([webcrackStateSelector], (webcrackState) => [{
          filepath: 'webcrackState.json',
          contents: JSON.stringify(webcrackState, null, 1)
        }])
      },

      // a selector does not need inputs, but it will execute only once and never refresh
      {
        key: 'readme',
        selector: createSelector([], () => [{
          filepath: 'README',
          contents: "made with webcrack"
        }])
      },

      {
        key: 'license',
        selector: createSelector([webcrackStateSelector], (webcrackState) => [{
          filepath: 'LICENSE.txt',
          contents: JSON.stringify(webcrackState)
        }])
      },



      // simply concats and cleans the css files
      {
        key: 'cssFile',
        selector: createSelector(webcrackStateSelector, (webcrackState) => {
          return [{
            filepath: 'style.css',
            contents: new CleanCSS({
                keepSpecialComments: 0
              })
              .minify(
                webcrackState.css.map((cssFile) => cssFile.contents).join('\n')
              ).styles
          }]
        })
      },

      {
        key: 'htmlFiles',
        selector: htmlFilesSelector
      },
    ]
  }
}
