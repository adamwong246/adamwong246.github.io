_ = require("lodash")
file_concat = require('concat')
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
mkdirp = require('mkdirp-then')

jade_opts =
  pretty: true

universe = ->
  "blog_entries":
    _.chain(
      _.map(
        glob.sync("_src/blog_entries/*"), (page) ->
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

writeFile = (output, options) ->
  fs.writeFile output, minify(jade.renderFile("./_src/page.jade", _.merge(jade_opts, memo_universe(), options )), {}), (err) ->
    if err
      console.log err
    else
      console.log output

task 'new.blog_entry', (options) ->
  maxPlusOne = Math.max.apply(null, _.map(glob.sync('_src/blog_entries/*'), (page) ->
    parseInt(path.basename(page, '.md'))
  )) + 1

  newFile = "./_src/blog_entries/#{maxPlusOne}/index.md"
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
  fs.writeFile "./index.html", jade.renderFile("./_src/index.jade", _.merge(jade_opts, memo_universe() )), (err) ->
    if err
      console.log err
    else
      console.log "index.html"
    return

task 'build.pages', (options) ->
  _.forEach memo_universe().pages, (page) ->
    fs.writeFile('.' + page.dest, jade.renderFile('./_src/page.jade', _.merge(jade_opts, memo_universe(), {page: page})))
    (err) ->
      if err
        console.log err
      else
        console.log 'The file was saved!'

task 'build.blogs', (options) ->
  _.forEach memo_universe().blog_entries, (blog_entry) ->
   console.log blog_entry
   destination = '.' + blog_entry.dest
   mkdirp(path.dirname(destination)).then () ->
     fs.writeFile destination,
     jade.renderFile('./_src/blog_entry_layout.jade', _.merge(jade_opts, memo_universe(), {entry: blog_entry})) ,
     (err) ->
       if err
         console.log err
       else
         console.log "> #{destination}"

task 'build.resume.html', (options) ->
  fs.writeFile "./resume.html", jade.renderFile("./_src/page.jade", _.merge(jade_opts, memo_universe(), {page: mm.parseFileSync("./_src/resume.md")} )), (err) ->
    if err
      console.log err
    else
      console.log "resume.html"

task 'build.readme', (options) ->
  writeFile "./README.html", {page: mm.parseFileSync("./README.md")}

task 'build.assets.style', (options) ->
  file_concat [
    './node_modules/normalize.css/normalize.css'
    './_src/flexbox-holy-grail.css'
    './_src/style.css'
  ], 'style.css', (error) ->
    console.log('style.css')

task 'build.assets.image', (options) ->
  _.forEach memo_universe().blog_entries, (blog_entry) ->
    _.each blog_entry.assets.jpgs, (jpg) ->
      dest = ".#{blog_entry.url}/#{path.basename(jpg)}"
      fs_extra.copy jpg, dest, (err) ->
        if (err)
          return console.error(err)
        console.log("#{jpg} -> #{dest}")

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

task 'build_serve_watch', (options) ->
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
