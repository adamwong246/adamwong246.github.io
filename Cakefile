_ = require("lodash")
readFiles = require('read-files-promise')
filendir = require('filendir')
fs = require("fs")
fs_extra = require('fs-extra')
glob = require("glob")
http = require('http')
jade = require("jade")
markdownpdf = require("markdown-pdf")
memoize = require('memoizee')
mm = require("marky-mark")
path = require('path')
slug = require("slug")
sstatic = require('node-static')
watch = require('watch')
minify = require('html-minifier').minify
mkdirp = require('mkdirp')
lwip = require('lwip')
CleanCSS = require('clean-css')

jade_opts =
  pretty: true

htmlMinOpts =
  removeAttributeQuotes: true
  removeComments: true
  removeTagWhitespace: true
  collapseWhitespace: true
  minifyJS: true

universe = ->
  "blogEntries":
    _.chain(
      _.map(
        glob.sync("_src/blogEntries/*"), (page) ->
          m = mm.parseFileSync(page + "/index.md")

          m.url = "/blog/#{path.basename(page)}-#{slug(m.meta.title)}"
          m.dest = m.url + "/index.html"
          m.src = page
          m.assets = {"jpgs": glob.sync("#{m.src }/*.jpg")}

          # filters and replaces instances of local assets with absolute paths
          _.each m.assets.jpgs, (jpg) ->
            m.content = m.content.replace(path.basename(jpg), m.url + "/" + path.basename(jpg))
          m
      )
    )
    .sortBy((n) ->new Date n.meta.publishedAt)
    .value().reverse()

  "pages": _.map(
    glob.sync("_src/pages/**/*.md"), (page) ->
      m = mm.parseFileSync(page)

      m.url = "/#{page.replace('_src/pages/', '').replace(/\.[^/.]+$/, '')}"

      m.dest = m.url + "/index.html"
      m.src = page
      m.assets = {"jpgs": glob.sync("#{m.src}/*.jpg")}

      # filters and replaces instances of local assets with absolute paths
      _.each m.assets.jpgs, (jpg) ->
        m.content = m.content.replace(path.basename(jpg), m.url + "/" + path.basename(jpg))

      m
  )
  "package": require("./package.json")
  "moment": moment = require("moment")

memo_universe = memoize(universe);

jadeWrite = (output, template, locals) ->
  mkdirp path.dirname(output), (err) ->
    if err then console.log err
    else
      fs.writeFile output, minify(jade.renderFile(template, _.merge(jade_opts, memo_universe(), locals )), htmlMinOpts), (err) ->
        if err
          console.log err
        else
          console.log output

task 'new.blogEntry', (options) ->
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
    if err
      console.log err
    else
      console.log(newFile)
    return

task 'build.index', (options) ->
  jadeWrite "./index.html", "./_src/index.jade", {}

task 'build.pages', (options) ->
  _.forEach memo_universe().pages, (page) ->
    jadeWrite ".#{page.dest}" , "./_src/page.jade", {page: page}

task 'build.blogs', (options) ->
  _.forEach memo_universe().blogEntries, (blogEntry) ->
   jadeWrite '.' + blogEntry.dest, './_src/blogEntryLayout.jade', {entry: blogEntry}

task 'build.resume.html', (options) ->
  jadeWrite './resume.html', './_src/page.jade', {page: mm.parseFileSync("./_src/resume.md")}

task 'build.readme', (options) ->
  jadeWrite "./README.html", "./_src/page.jade", {page: mm.parseFileSync("./README.md")}

task 'build.assets.style', (options) ->
  styleFiles = [
    './node_modules/normalize.css/normalize.css'
    './_src/flexbox-holy-grail.css'
    './_src/style.css'
  ]
  outFile = 'style.css'
  readFiles(styleFiles, {encoding: 'utf8'})
  .then (buffers) ->
    buffers.join(' \n ')
  .then (joined) ->
    fs.writeFile outFile, new CleanCSS({
      keepSpecialComments: 0
    }).minify(joined).styles, (err) ->
      if err then console.log console.error
      else
        console.log "#{JSON.stringify styleFiles, null, 2} > #{outFile}"

task 'build.assets.image', (options) ->
  _.forEach memo_universe().blogEntries, (blogEntry) ->
    _.each blogEntry.assets.jpgs, (srcPath) ->

      optDest = ".#{blogEntry.url}/#{path.basename(srcPath)}"
      lwip.open srcPath, (err, image) ->
        image.batch()
        .scale(0.2)
        .writeFile(optDest,'jpg', {quality: 50}, (err) ->
          if err then console.log err
          else console.log "#{srcPath} > #{optDest}"
        )

      origDest = ".#{blogEntry.url}/orig-#{path.basename(srcPath)}"
      fs_extra.copy srcPath, origDest, (err) ->
        if (err)
          return console.error(err)
        console.log("#{srcPath} -> #{origDest}")

task 'build', (options) ->
  invoke('build.index')
  invoke('build.blogs')
  invoke('build.pages')
  invoke('build.readme')
  invoke('build.resume.html')
  invoke('build.assets.style')
  invoke('build.assets.image')

task 'server', (options) ->
  console.log('server now running on port 8080...')
  file = new (sstatic.Server)('.')
  http.createServer((req, res) ->
    file.serve req, res
    return
  ).listen 8080

task 'develop', (options) ->
  invoke('build')
  invoke('server')

  watch.createMonitor './_src', (monitor) ->
    monitor.files['/**/*']

    monitor.on 'created', (f, stat) ->
      memo_universe.clear();
      invoke('build')
      return
    monitor.on 'changed', (f, curr, prev) ->
      memo_universe.clear();
      invoke('build')
      return
    monitor.on 'removed', (f, stat) ->
      memo_universe.clear();
      invoke('build')
      return
    # monitor.stop()
    return
