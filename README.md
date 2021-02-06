# README
## adamwong246.github.io

This is my personal website, made with my custom build-tool [funkophile](https://github.com/adamwong246/adamwong246.github.io/tree/dev/funkophile).

Because of the nature of github pages, development is done on the [dev branch](https://github.com/adamwong246/adamwong246.github.io/tree/dev).

### features

- a resume generator that creates a pdf and html document from a markdown file
- an image pipeline to transform your jpegs

### Directory structure

- `src` - the source folder
  - `assets` - css and images
  - `blogEntries` - the content of my blog
    - `n` - a blog entry
      - `index.md` - the content of the blog entry
      - `*.jpg` - image files pertaining to the blog entry
      - `assets.json` - a file describing the transforms to be made to any images
  - `pages` - jade files to be rendered. These are outputed in a way that maintains their directory structure.
  - `views` - layout templates
