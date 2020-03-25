module.exports = {

  contentsOfFiles: (selector) => {
    return createSelector([selector], (selected) => {
      return Object.keys(selected).reduce((mm, k) => mm + selected[k], '')
    })
  },

  contentOfFile: (selector) => {
    return createSelector([selector], (selected) => {
      return selected[Object.keys(selected)[0]]
    })
  },

  srcAndContentOfFile: (selector, key) => {
    return createSelector([selector], (selected) => {
      return {
        src: key,
        content: selected[key]
      }
    })
  },

  srcAndContentOfFiles: (selector) => {
    return createSelector([selector], (selected) => {
      const keys = Object.keys(selected)
      return keys.map((key) => {
        return { src: key, content: selected[key] }
      })
    })
  }
}
