createStore = require('redux').createStore;
createSelector = require('reselect').createSelector;

const {
  INITIALIZE,
  ADD_INTERMEDIATE_SELECTORS
} = require('./constants.js');
const utils = require('./utils.js');
const options = utils.options;
const readfile = utils.readfile;
const logSkipFile = utils.logSkipFile;
const logReadFile = utils.logReadFile;
const logWriteFile = utils.logWriteFile;


const makeStore = (configs) => {
  const store = createStore((state = {
    initialLoad: true,
    intermediateSelectors: [],
    writeSelectors: [],
    ...configs.initialState
  }, action) => {
    console.log(action.type, action.payload);

    if (!action.type.includes('@@redux')) {

      if (action.type === INITIALIZE) {
        return {
          ...state,
          initialLoad: false
        }
      } else if (action.type === ADD_INTERMEDIATE_SELECTORS) {
        return {
          ...state,
          intermediateSelectors: {
            ...state.intermediateSelectors,
            [action.payload.key]: action.payload.selector
          }

        }
      } else {
        const config = configs.rules.find((c) => c.key === action.type)
        return config.stateMutater(state, action, options);
      }

    }
  })

  const baseSelector = (store) => {
    return createSelector(store.getState, (state) => {
      return state
    });
  };

  const selectors = configs.makeSelectors(baseSelector);
  const keys = Object.keys(selectors);
  keys.forEach((selectorKey) => {
    store.dispatch({
      type: ADD_INTERMEDIATE_SELECTORS,
      payload: {
        key: selectorKey,
        selector: selectors[selectorKey]
      }
    })
  });


  return {store}
}

module.exports = makeStore;

// switch (action.type) {
//   case INITIALIZE:
//
//   case PACKAGE_JSON:
//     return {
//       ...state,
//       package: action.payload
//     }
//   case UPSERT_PAGE:
//     newPage = {};
//     newPage.content = readfile(action.payload)
//
//     const pageSrc = action.payload;
//     const baseFileName = action.payload.split('.')[1].split('/').slice(-1)[0]
//     const dest = `./${options.outFolder}/${baseFileName}/index.html`
//
//
//     newPage.url = `/${baseFileName}/index.html`
//     newPage.dest = dest
//     newPage.title = baseFileName
//
//     console.log("dest", newPage.dest)
//
//     return {
//       ...state,
//       pages: {
//           ...state.pages,
//           [pageSrc]: newPage
//         },
//         writeSelectors: {
//           ...state.writeSelectors,
//           [dest]: createSelector([blogEntriesSelector, pagesSelector, initialLoadSelector, packageSelector, viewsSelector], (blogEntries, pages, initialLoad, package, views) => {
//             const page = pages[pageSrc]
//             const viewString = views['src/views/page.jade']
//             if (initialLoad) {
//               logSkipFile(pageSrc)
//             } else {
//               jadeRender(pageSrc, page, {
//                 pages,
//                 package,
//                 blogEntries: blogEntries
//               }, viewString);
//             }
//
//           })
//         }
//     }
//
//   case UPSERT_STYLE:
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
//   case UPSERT_BLOGENTRY:
//     const blogSrc = action.payload;
//     var m;
//     m = mm.parseFileSync(blogSrc);
//     m.url = "./" + options.outFolder + "/blog/" +  (slug(m.meta.title)) + '/index.html';
//     m.dest = m.url;
//
//     const mdDest = m.url
//
//     const blogEntryWriteSelector = createSelector([packageSelector, blogEntriesSelector, initialLoadSelector, pagesSelector], (package, blogEntries, initialLoad, pages) => {
//         const blogEntry = blogEntries[blogSrc]
//         if (initialLoad) {
//           logSkipFile(blogSrc)
//         } else {
//           blogEntryWrite(mdDest, blogEntry, {
//             pages,
//             package,
//             blogEntries: blogEntries
//           });
//         }
//       }
//     )
//
//     return {
//       ...state,
//       blogEntries: {
//           ...state.blogEntries,
//           [blogSrc]: m
//         },
//         writeSelectors: {
//           ...state.writeSelectors,
//           [mdDest]: blogEntryWriteSelector
//         }
//     }
//   case UPSERT_VIEW:
//     const viewSrc = "./" + action.payload;
//
//     newView = readfile(action.payload)
//
//     return {
//       ...state,
//       views: {
//           ...state.views,
//           [viewSrc]: m
//         }
//     }
//   default:
//     return state
//   }
