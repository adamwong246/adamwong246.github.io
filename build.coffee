fs = require("fs")
dir = require("node-dir")
path = require("path")
frontMatter = require("yaml-front-matter")
markdown = require("markdown").markdown
merge = require('merge')
deepMerge = require('deepmerge')
beautify_html = require("js-beautify").html
mkdirp = require("mkdirp")
glob = require("glob")
util = require("util")
eyes = require('eyes')

# Write a file, making dirs as needed.
writeFileWithIndifferentWrite = (dest, content) ->
  mkdirp dest.split("/").slice(0, -1).join("/"), (err) ->
    if err
      console.error err
    else
      fs.writeFile dest, content
    return

  return

# Build content tree from yaml files
# add js object literals
# execute model tree

fmh_array = glob.sync("./_src/_blog/**/*.md").map((e) ->
  path
  .relative("./_src/", e)
  .split("/")
  .reduceRight ((p, c) ->
    b = {}
    b[c] = p
    b
  ), merge(frontMatter.loadFront(e),
    path: e
  )
)

js_array = glob.sync("./_src/_blog/_.js").map((e) ->
  path
  .relative("./_src/", e)
  .split("/")
  .reduceRight ((p, c) ->
    b = {}
    b[c] = p
    b
  ), require('./_src/_blog/_.js')
)

merged = (fmh_array.concat(js_array)).reduce((p,c,i,a) ->
  deepMerge(p,c)
)
eyes.inspect(merged)
