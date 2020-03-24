module.exports = (reduxState) => {


  const resumeSelector = ([reduxState], (state) => {
    return state.resume
  })

  const blogEntriesJpgsSelector = ([reduxState], (state) => {
    return state.blogEntriesJpgs
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



  const cssSelector = ([reduxState], (state) => {
    return Object.keys(state.css).map((c) => {
      return state.css[c]
    })
  })

  const licenseOutput = createSelector([reduxState], (state) => {
    return {
      'LICENSE.txt': state.license
    }
  });

  const resumeMdOuput = createSelector([resumeSelector], (resume) => {
    return {
      'resume.md': resume
    }
  });

  const cssOutput = createSelector(cssSelector, (css) => {
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
  });

  const resumePdfOutput = createSelector([resumeSelector], (resume) => {
    return {
      'resume.pdf': markdownpdf().from.string(resume).to.buffer
    };
  });


  const htmlFileOutput = createSelector([
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
      })
    }
  });

  const blogEntriesJpgsOutput = createSelector([blogEntriesJpgsSelector, blogEntriesSelector], (jpgs, blogEntries) => {
    return jpgs.reduce((mm, jpg) => {
      const jpgSplit = jpg.src.split('/')
      return {
        ...mm,
        [blogEntries.find((b) => jpg.src.includes(b.srcFolder)).destFolder + jpgSplit[jpgSplit.length - 1]]: jpg.contents
      }
    }, {})
  });

  return {
    blogEntriesJpgsOutput,
    cssOutput,
    htmlFileOutput,
    licenseOutput,
    resumeMdOuput,
    resumePdfOutput
  }

};
