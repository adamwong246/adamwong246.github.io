createSelector = require('reselect').createSelector;



module.exports = (selectors, resumeSelector) => {
  console.log(selectors.pages)
  const blogEntriesSelector = createSelector(selectors.blogEntries, (blogEntries) => {
    const keys = Object.keys(blogEntries)
    return keys.map((key) => {
      const markdownContent = markdown.parse(blogEntries[key])

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

  return createSelector([
    createSelector(() => {
      return require("./package.json")
    }),
    createSelector(selectors.pages, (pages) => {
      return [];
      // console.log(pages)
      // const keys = Object.keys(pages)
      // console.log(keys)
      //
      // return keys.map((key) => {
      //   const page = pages[key]
      //   const baseFileName = key.split('.')[1].split('/').slice(-1)[0];
      //
      //   let dest, url;
      //
      //   if (baseFileName !== 'index') {
      //     dest = `${baseFileName}/index.html`
      //     url = `/${baseFileName}/index.html`
      //   } else {
      //     dest = `index.html`
      //     url = `/index.html`
      //   }
      //   return {
      //     key,
      //     content: page,
      //     dest: dest,
      //     url: url,
      //     title: baseFileName
      //   }
      // })
    }),
    blogEntriesSelector,
    createSelector(resumeSelector, (resume) => markdown.parse(resume)),
    createSelector([selectors.views], (views) => {
      console.log(selectors.views)
      console.log(views)
      const key = './src/views/page.jade'
      return {
        src: key,
        content: views[key]
      }
    }),
    createSelector(selectors.views, (views) => {
      const key = './src/views/blogEntryLayout.jade'
      return {
        src: key,
        content: views[key]
      }
    })
  ], (package, pages = [], blogEntries = [], markdownResume, pageLayout, blogEntryLayout) => {
    const localsToJadeRender = {
      blogEntries,
      pages,
      package
    }

    // const processedPages = pages.reduce((mm, page) => {
    //   return {
    //     ...mm,
    //     [page.dest]: jade.render(page.content, {
    //       filename: pageLayout.src,
    //       page,
    //       ...localsToJadeRender
    //     })
    //   }
    // }, {});
    //
    // const processedBlogEntries = blogEntries.reduce((mm, blogEntry) => {
    //   return {
    //     ...mm,
    //     [blogEntry.dest]: jade.render(blogEntryLayout.content, {
    //       filename: blogEntryLayout.src,
    //       entry: blogEntry,
    //       page: {
    //         content: blogEntry.markdownContent,
    //       },
    //       ...localsToJadeRender
    //     })
    //   }
    // }, {});

    console.log(pageLayout)

    return {
      // ...processedBlogEntries,
      // ...processedPages,
      'resume.html': jade.render(pageLayout.contents, {
        filename: pageLayout.src,
        page: {
          content: markdownResume.content
        },
        ...localsToJadeRender
      })
    }
  });
}
