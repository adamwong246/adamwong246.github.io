fs = require("fs")
dir = require("node-dir")
path = require("path")
frontMatter = require("yaml-front-matter")
markdown = require("markdown").markdown
merge = require("deepmerge")
beautify_html = require("js-beautify").html
mkdirp = require("mkdirp")
glob = require("glob")
util = require("util")

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

content_tree = merge.apply({}, glob.sync("./_src/_blog/**/*.md").map((e) ->
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
))

console.log JSON.stringify(content_tree)
console.log content_tree._blog["0"]["index.md"].title

