var ReactDOM = require('react-dom/server');
var React = require('react'); /* importing react */

module.exports = (
  pagesSelector,
  blogEntriesSelectorWithUpdatedImageLinks,
  resumeSelector,
  pageJadeSelector,
  blogEntryJadeLayout,
  notFoundSelector,
  contactSelector,
  pagesReactSelector,
) => {

  return createSelector([
    createSelector(() => {
      return require("./package.json")
    }),
    pagesSelector,
    blogEntriesSelectorWithUpdatedImageLinks,
    createSelector(resumeSelector, (resume) => markdown.parse(resume)),
    pageJadeSelector,
    blogEntryJadeLayout,
    notFoundSelector,
    contactSelector,
    pagesReactSelector,
  ], (package, pages, blogEntries, markdownResume, pageLayout, blogEntryLayout, notFoundContent, contacts, pagesReact) => {
    const localsToJadeRender = {
      blogEntries,
      pages,
      package,
      contacts
    }

    // // console.log(react)
    // const reactString = react[Object.keys(react)[0]].toString()
    // // console.log(reactString)
    //
    //
    //
    // // console.log(React.createElement(returned, {toWhat: 'World'}, null))
    // console.log(ReactDOM.renderToString(
    //   React.createElement(returned, {toWhat: 'World'}, null)
    // )), '';

    const processedReactPages = pagesReact.reduce((mm, page) => {
      const returned = eval(page.content.toString());

      console.log(returned)
      return {
        ...mm,
        [page.dest]: ReactDOM.renderToString(
          React.createElement(returned, {toWhat: 'World'}, null)
        )
      }
    }, {});

    const processedJadePages = pages.reduce((mm, page) => {
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
      ...processedJadePages,
      ...processedReactPages,
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
}
