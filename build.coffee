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

buildContent = (path_to_data_file) ->
  deepMerge path.relative(".", path_to_data_file).split("/").reduceRight(((p, c) ->
    b = undefined
    b = {}
    b[c] = p
    b
  ), require(path_to_data_file)), glob.sync(path_to_data_file.split("/").slice(0, -1).concat("**/*.md").join("/")).map((e) ->
    path.relative(".", e).split("/").reduceRight ((p, c) ->
      b = undefined
      b = {}
      b[c] = p
      b
    ), merge(frontMatter.loadFront(e),
      path: e
    )
  ).reduce((p, c, i, a) ->
    deepMerge p, c
  )


content = buildContent("./_src/_blog/_.js")
console.log('##############################')
eyes.inspect(content)
