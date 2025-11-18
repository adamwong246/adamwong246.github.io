# README
## adamwong246.github.io

This is my personal website, made with my custom build-tool [funkophile](https://github.com/adamwong246/adamwong246.github.io/tree/dev/funkophile).

Because of the nature of github pages, development is done on the [dev branch](https://github.com/adamwong246/adamwong246.github.io/tree/dev).

### features

- a resume generator that creates a pdf and html document from a markdown file
- an image pipeline to transform your jpegs

### Other requirements

#### pandoc

```
brew install pandoc
brew install --cask basictex
brew install weasyprint
sudo ln -s /Library/TeX/Root/bin/universal-darwin/pdflatex /usr/local/bin/pdflatex

```

## AI Directives

Do not use "default" values unless there is a very good reason to do so. Prefer to throw errors rather than obscure the problem.