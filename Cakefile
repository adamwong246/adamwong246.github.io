_         = require("lodash")
readFiles = require('read-files-promise')
fs        = require("fs")
fs_extra  = require('fs-extra')
glob      = require("glob")
http      = require('http')
jade      = require("jade")
memoize   = require('memoizee')
mm        = require("marky-mark")
path      = require('path')
slug      = require("slug")
sstatic   = require('node-static')
watch     = require('watch')
minify    = require('html-minifier').minify
mkdirp    = require('mkdirp')
lwip      = require('lwip')
CleanCSS  = require('clean-css')

memoUniverse = memoize ->
  "blogEntries":
    _.chain(
      _.map(
        glob.sync("_src/blogEntries/*"), (page) ->
          m = mm.parseFileSync(page + "/index.md")
          m.url = "/blog/#{path.basename(page)}-#{slug(m.meta.title)}"

          m.dest = m.url + "/index.html"
          m.src = page
          m.assets = {"jpgs": glob.sync("#{m.src}/*.jpg")}
          _.each m.assets.jpgs, (jpg) ->
            m.content = m.content.replace(path.basename(jpg), m.url + "/" + path.basename(jpg))
          m
      )
    )
    .sortBy (n) -> new Date n.meta.publishedAt
    .select (n) -> n.meta.publish != false
    .value()
    .reverse()

  "pages":
    _.union(
      _.chain(glob.sync("_src/pages/**/*.jade"))
      .map (jadeFile) ->
        page = {}
        page.content = jade.renderFile(jadeFile)
        page.url = "/#{jadeFile.replace('_src/pages/', '').replace(/\.[^/.]+$/, '')}"
        page.dest = page.url + "/index.html"
        page.src = jadeFile
        page
      .value()
    ,
      _.chain(glob.sync("_src/pages/**/*.md"))
      .map (markdownFile) ->
        m = mm.parseFileSync(markdownFile)
        m.url = "/#{markdownFile.replace('_src/pages/', '').replace(/\.[^/.]+$/, '')}"
        m.dest = m.url + "/index.html"
        m.src = markdownFile
        m.assets = {"jpgs": glob.sync("#{m.src}/*.jpg")}
        _.each m.assets.jpgs, (jpg) ->
          m.content = m.content.replace(path.basename(jpg), m.url + "/" + path.basename(jpg))
        m
      .select (n) -> n.meta.publish != false
      .value()
    )

  "package": require("./package.json")
  "moment": moment = require("moment")

jadeWrite = (out, template, locals, options) ->
  mkdirp path.dirname(out), (err) ->
    if err then console.log err
    else
      if options.minify
        output = minify(jade.renderFile(template, _.merge(memoUniverse(), locals )),
          removeAttributeQuotes: true
          removeComments: true
          removeTagWhitespace: true
          collapseWhitespace: true
          minifyJS: true
        )
      else
        output = jade.renderFile(template, _.merge(pretty: true, memoUniverse(), locals ))
      fs.writeFile out, output, (err) ->
        if err then console.error(err) else console.log("---> #{out}")

build = (options) ->
  jadeWrite "#{options.outFolder}/index.html", "./_src/index.jade", {}, {minify: options.minify}

  jadeWrite "#{options.outFolder}/blog.html", "./_src/blog.jade", {}, {minify: options.minify}

  _.each memoUniverse().blogEntries, (blogEntry) ->
   jadeWrite "#{options.outFolder}#{blogEntry.dest}", './_src/blogEntryLayout.jade', {entry: blogEntry}, {minify: options.minify}

  _.each memoUniverse().pages, (page) ->
    jadeWrite "#{options.outFolder}#{page.dest}" , "./_src/page.jade", {page: page}, {minify: options.minify}

  jadeWrite "#{options.outFolder}/README.html", "./_src/page.jade", {page: mm.parseFileSync("./README.md")}, {minify: options.minify}

  outFile = "#{options.outFolder}/style.css"
  readFiles([
    './node_modules/normalize.css/normalize.css'
    './_src/style.css'
  ], {encoding: 'utf8'})
  .then (buffers) ->
    buffers.join(' \n ')
  .then (joined) ->
    fs.writeFile outFile, new CleanCSS({
      keepSpecialComments: 0
    }).minify(joined).styles, (err) ->
      if err then console.error err else console.log "---> #{outFile}"

  _.each memoUniverse().blogEntries, (blogEntry) ->
    _.each blogEntry.assets.jpgs, (srcPath) ->
      optDest = "#{options.outFolder}#{blogEntry.url}/#{path.basename(srcPath)}"
      lwip.open srcPath, (err, image) ->
        image.batch()
        .scale(0.2)
        .writeFile(optDest,'jpg', {quality: 50}, (err) ->
          if err then console.error err else console.log "---> #{optDest}"
        )

      origDest = "#{options.outFolder}#{blogEntry.url}/orig-#{path.basename(srcPath)}"
      fs_extra.copy srcPath, origDest, (err) ->
        if err then console.error(err) else console.log("---> #{origDest}")

  profilePicOutfile = "#{options.outFolder}/evilShroom.png"
  fs_extra.copy "_src/evilShroom.png", profilePicOutfile, (err) ->
    if err then console.error(err) else console.log("---> #{profilePicOutfile}")

task 'develop', "build and run the development server", (options) ->
  outFolder = './tmp'
  fs_extra.removeSync(outFolder)
  build {outFolder: outFolder, minify: false}
  http.createServer((req, res) ->
    new (sstatic.Server)(outFolder).serve req, res ).listen 8080
  console.log('server now running on port 8080...')
  watch.createMonitor './_src', (monitor) ->
    monitor.files['./**/*']
    monitor.on 'created', (f, stat) ->
      memoUniverse.clear();
      build {outFolder: outFolder, minify: false}
    monitor.on 'changed', (f, curr, prev) ->
      memoUniverse.clear();
      build {outFolder: outFolder, minify: false}
    monitor.on 'removed', (f, stat) ->
      memoUniverse.clear();
      build {outFolder: outFolder, minify: false}

task 'produce', "build a production version", (options) ->
  build {outFolder: '.', minify: true}

task 'new.blogEntry', "generate a new empty blog post", (options) ->
  maxPlusOne = Math.max.apply(null, _.map(glob.sync('_src/blogEntries/*'), (page) ->
    parseInt(path.basename(page, '.md'))
  )) + 1

  newFile = "./_src/blogEntries/#{maxPlusOne}/index.md"
  fs_extra.outputFile newFile, """
  ---
  title: CHANGE ME
  publishedAt: #{new Date().toString()}
  ---
  """, (err) ->
    if err then console.error(err) else console.log newFile
