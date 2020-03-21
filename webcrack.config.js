
const moment = require('moment');
CleanCSS = require('clean-css');

const {logReadFile, readfile} = require('./webcrack/lib/utils.js');

module.exports = {
  initialState: {
    views: {},
    pages: {},
    blogEntries: {},
    cssAssets: {},
    moment: moment
  },
  rules:  [{
      key: 'PACKAGE_JSON',
      simpleFile: require('./package.json'),
      stateMutater: (state, action, options) => {
        return {
          ...state,
          package: action.payload
        }
      }
    },

    {
      key: 'UPSERT_STYLE',
      path: 'assets',
      glob: '*.css',
      stateMutater: (state, action, options) => {
        const viewSrc = action.payload;
        const contents = readfile(action.payload)
        const cssSrc = "./" + action.payload;
        const cssDest = "./" + options.outFolder + '/style.css'

        // console.log('state.intermediateSelectors', state.intermediateSelectors)
        return {
          ...state,
          cssAssets: {
            ...state.cssAssets,
            [cssSrc]: readfile(action.payload)
          },
          writeSelectors: {
            ...state.writeSelectors,
            [cssDest]: createSelector(
              [state.intermediateSelectors.cssSelector, state.intermediateSelectors.initialLoadSelector],
              (cssFiles, initialLoad) => {
                // console.log('cssFiles', cssFiles)
                // console.log('initialLoad', initialLoad)
                if (initialLoad) {
                  logSkipFile(cssDest);
                } else {
                  return fs.writeFile(cssDest, new CleanCSS({
                    keepSpecialComments: 0
                  }).minify(Object.keys(cssFiles).map((writeKey) => {
                    return cssFiles[writeKey]
                  }).join('\n')).styles, function(err) {
                    if (err) {
                      return console.error(err);
                    } else {
                      return logWriteFile(cssDest)
                    }
                  });
                }
              }
            )
          }
        }
      }
    },

    //   action: (state, action, options) => {
    //     const cssSrc = "./" + action.payload;
    //     const cssDest = "./" + options.outFolder + '/style.css'
    //
    //     const cssWriteSelector = createSelector([cssSelector, initialLoadSelector], (cssFiles, initialLoad) => {
    //       if (initialLoad) {
    //         logSkipFile(cssDest);
    //       } else {
    //         return fs.writeFile(cssDest, new CleanCSS({
    //           keepSpecialComments: 0
    //         }).minify(Object.keys(cssFiles).map((writeKey) => {
    //           return cssFiles[writeKey]
    //         }).join('\n')).styles, function(err) {
    //           if (err) {
    //             return console.error(err);
    //           } else {
    //             return logWriteFile(cssDest)
    //           }
    //         });
    //       }
    //
    //     });
    //
    //     return {
    //       ...state,
    //       cssAssets: {
    //           ...state.cssAssets,
    //           [cssSrc]: readfile(action.payload)
    //         },
    //         writeSelectors: {
    //           ...state.writeSelectors,
    //           [cssDest]: cssWriteSelector
    //         }
    //     }
    //   }
    // },
    // {
    //   key: UPSERT_PAGE,
    //   path: 'pages',
    //   glob: '**/*.jade',
    //   reader: (action) => {
    //     const pageSrc = action.payload;
    //     const dest = options.outFolder + '/' + action.payload.split('.')[0].replace(`${options.inFolder}/pages/`, '') + '/index.html';
    //
    //     const baseFileName = action.payload.split('.')[0].split('/').slice(-1)[0]
    //
    //     newPage = {};
    //     newPage.content = readfile(action.payload)
    //
    //     if (baseFileName === 'index') {
    //       newPage.url = "/" + (pageSrc.replace(`${options.inFolder}/pages/`, '').replace('.jade', '.html'))
    //       newPage.dest = `${options.outFolder}/index.html`
    //     } else {
    //       newPage.url = "/" + (pageSrc.replace(`${options.inFolder}/pages/`, '').replace(/\.[^\/.]+$/, ''))
    //       newPage.dest = dest
    //     }
    //     return newPage;
    //   },
    //   writer: () => {
    //     return createSelector([blogEntriesSelector, pagesSelector, initialLoadSelector, packageSelector, viewsSelector], (blogEntries, pages, initialLoad, package, views) => {
    //       const page = pages[pageSrc]
    //       const viewString = views['src/views/page.jade']
    //       if (initialLoad) {
    //         logSkipFile(pageSrc)
    //       } else {
    //         jadeRender(pageSrc, page, {
    //           pages,
    //           package,
    //           blogEntries: blogEntries
    //         }, viewString);
    //       }
    //     })
    //   }
    // },
    // {
    //   key: UPSERT_BLOGENTRY,
    //   path: 'blogEntries',
    //   glob: '**/index.md',
    //   reader: (actions) => {
    //     const blogSrc = action.payload;
    //     var m;
    //     logReadFile(blogSrc)
    //     m = mm.parseFileSync(blogSrc);
    //     m.url = "./" + options.outFolder + "/blog/" + (slug(m.meta.title)) + '/index.html';
    //     m.dest = m.url;
    //   },
    //   writer: () => {
    //     blogEntryWrite(mdDest, blogEntry, {
    //       pages,
    //       package,
    //       blogEntries: blogEntries
    //     });
    //   }
    // },
    // {
    //   key: UPSERT_VIEW,
    //   path: 'views',
    //   glob: '*.jade',
    //   reader: (actions) => {
    //     return readfile("./" + action.payload);
    //   }
    // },

  ],
  makeSelectors: (baseSelector) => {
    return {
      initialLoadSelector: createSelector([baseSelector], (state) => state.initialLoad),
      packageSelector: createSelector([baseSelector], (state) => state.package),
      pagesSelector: createSelector([baseSelector], (baseState) => baseState.pages),
      cssSelector: createSelector([baseSelector], (baseState) => baseState.cssAssets),
      blogEntriesSelector: createSelector([baseSelector], (baseState) => baseState.blogEntries),
      viewsSelector: createSelector([baseSelector], (baseState) => baseState.views),
    }
  }
}

const blogEntryWrite = function(dest, blogEntry, baseState) {
  return mkdirp(path.dirname(dest), function(err) {
    var output;
    if (err) {
      return console.log(err);
    } else {
      if (options.minify) {
        output = minify(jade.renderFile(template, _.merge(options, locals)), {
          removeAttributeQuotes: true,
          removeComments: true,
          removeTagWhitespace: true,
          collapseWhitespace: true,
          minifyJS: true
        });
      } else {
        output = jade.renderFile(`./${options.inFolder}/views/blogEntryLayout.jade`, {...baseState, entry: blogEntry});
      }
      return fs.writeFile(dest, output, function(err) {
        if (err) {
          return console.error(err);
        } else {
          return logWriteFile(dest)
        }
      });
    }
  });
};

const jadeRender = function(src, page, baseState, viewString) {
  const out = page.dest;

  return mkdirp(path.dirname(out), function(err) {
    var output;
    if (err) {
      return console.log(err);
    } else {
      if (options.minify) {
        // output = minify(jade.renderFile(template, _.merge(options, locals)), {
        //   removeAttributeQuotes: true,
        //   removeComments: true,
        //   removeTagWhitespace: true,
        //   collapseWhitespace: true,
        //   minifyJS: true
        // });
      } else {

        output = jade.render(viewString, {
          filename: src,
          content: page.content,
          ...baseState
        });
      }

      return fs.writeFile(out, output, function(err) {
        if (err) {
          return console.error(err);
        } else {
          return logWriteFile(out)
        }
      });
    }
  });
};
