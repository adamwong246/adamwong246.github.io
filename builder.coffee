_ = require("lodash")
dust = require('dustjs-linkedin')
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
moment = require('moment')
path = require('path')
Promise = require("bluebird")
slug = require("slug")
sstatic = require('node-static')
watch = require('watch')

myPackage = require('./package.json')

Promise.promisifyAll(fs)
Promise.promisifyAll(mm)

model = new Promise( (fulfill, reject) ->
 res = {
   'blog_entries': _.sortBy(_.map(glob.sync('_src/blog_entries/*'), (page) ->
     m = undefined
     m = mm.parseFileSync(page + '/index.md')
     m.url = '/blog/' + path.basename(page) + '-' + slug(m.meta.title)
     m.dest = m.url + '/index.html'
     m.src = page
     m.assets = 'jpgs': glob.sync(m.src + '/*.jpg')
     _.each m.assets.jpgs, (jpg) ->
       m.content = m.content.replace(path.basename(jpg), m.url + '/' + path.basename(jpg))
     m
   ), (n) ->
     n.meta.publishedAt
   )
   'package': myPackage
   'moment': moment
   'readme': mm.parseFileAsync("./README.md")
   'resume': mm.parseFileAsync("./_src/resume.md")
  }

 fulfill(res)
)

dustLoad = (filePath, key) ->
 fs.readFileAsync(filePath, 'utf8')
 .then (res) ->
  dust.compile res, key
 .then (res) ->
  dust.loadSource res

dustLoadPromiseLayout = dustLoad('_src/layout.dust', 'layout')
dustLoadPromiseBlogPartial = dustLoad('_src/blogPartial.dust', 'blogPartial')

exports = module.exports = {}
exports.outputDir = './'
exports.build = {}
exports.build.resume = {}
exports.build.resume.html = {}
exports.build.resume.pdf = {}
exports.build.assets = {}
exports.new = {}
exports.new.blog = {}

exports.build.index = () ->
 Promise.all([
  dustLoadPromiseLayout
  dustLoadPromiseBlogPartial
  dustLoad('_src/index.dust', 'index')
 ])
 .then () ->
  model.then (modelResolved) ->
   dust.render 'index', modelResolved, (err, res) ->
    throw err if err
    console.log "writing index to #{exports.outputDir}index.html"
    fs.writeFile "#{exports.outputDir}index.html", res, (err) ->
     throw err if err

exports.build.readme = () ->
 Promise.all([
  dustLoadPromiseLayout
  dustLoad('_src/readme.dust', 'readme')
 ])
 .then () ->
  model.then (modelResolved) ->
   dust.render 'readme', modelResolved, (err, res) ->
    throw err if err
    fs.writeFile "#{exports.outputDir}README.html", res, (err) ->
     throw err if err

exports.build.resume.html = () ->
 Promise.all([
  dustLoadPromiseLayout
  dustLoad('_src/resume.dust', 'resume')
 ]).then () ->
  model.then (modelResolved) ->
   dust.render 'resume', modelResolved, (err, res) ->
    throw err if err
    fs.writeFile "#{exports.outputDir}resume.html", res, (err) ->
     throw err if err

exports.build.blogs = () ->
 Promise.all([
  dustLoadPromiseLayout
  dustLoadPromiseBlogPartial
  dustLoad('_src/blogLayout.dust', 'blogLayout')
  ]).then () ->
   model.then (modelResolved) ->
    _.forEach modelResolved.blog_entries, (blogEntry) ->
     dust.render 'blogLayout', _.merge(modelResolved, {blogEntry: blogEntry}), (err, res) ->
      throw err if err
      filendir.wa(exports.outputDir + blogEntry.dest, res, (err) ->
       throw err if err
      )

exports.build.resume.pdf = () ->
 markdownpdf().from('_src/resume.md').to "#{exports.outputDir}/resume.pdf", ->
   return

exports.build.assets.style = () ->
 file_concat [
   './node_modules/normalize.css/normalize.css'
   './_src/flexbox-holy-grail.css'
   './_src/typebase.css'
   './_src/style.css'
 ], "#{exports.outputDir}style.css", (error) ->
   console.log('style.css')
   return

exports.build.assets.images = () ->
 model.then (modelResolved) ->
  _.forEach modelResolved.blog_entries, (blog_entry) ->
   _.each blog_entry.assets.jpgs, (jpg) ->
    dest = "#{exports.outputDir}#{blog_entry.url}/#{path.basename(jpg)}"
    fs_extra.copy jpg, dest, (err) ->
     throw err if err
     console.log("#{jpg} -> #{dest}")

exports.new.blog = () ->
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
  throw err if err

exports.server = () ->
 console.log('server now running on port 8080...')
 file = new (sstatic.Server)(exports.outputDir)
 http.createServer((req, res) ->
  file.serve req, res
  return
 ).listen 8080
