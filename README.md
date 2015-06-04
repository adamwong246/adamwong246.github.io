## README

> "It can scarcely be denied that the supreme goal of all theory is to make the irreducible basic elements as simple and as few as possible without having to surrender the adequate representation of a single datum of experience." ~ Albert Einstein

An exceedingly simple blog written in coffeescript, run with  cake, managed with npm and hosted on Github pages.

```
Cakefile defines the following tasks:

cake new.blog
cake build.index
cake build.readme
cake build.resume.html
cake build.blogs
cake build.resume.pdf
cake build.assets.style
cake build.assets.images
cake build
cake server
cake build_serve

  -o, --output       directory for compiled code
```

To build the site in a temporary directory
```
cake -o tmp/ build
```

To build the site the current directory, before pushing to github
```
cake build
```

The default build directory is `.`

### Credits
- http://necolas.github.io/normalize.css
- http://philipwalton.github.io/solved-by-flexbox/demos/holy-grail
- http://devinhunt.github.io/typebase.css
- and all contributors to node and it's packages
