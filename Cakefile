builder = require('./builder.coffee')

sstatic = require('node-static')

setOutputDirByOption = (opt) ->
 if opt
  builder.outputDir = opt
  console.log "builder.outputDir is: #{builder.outputDir}"

option '-o', '--output [DIR]', 'directory for compiled code'

task 'new.blog', (options) ->
  console.log 'new.blog'
  builder.new.blog()

task 'build.index', (options) ->
  console.log 'build.index'
  setOutputDirByOption options.output
  builder.build.index()

task 'build.readme', (options) ->
   console.log 'build.readme'
   setOutputDirByOption options.output
   builder.build.readme()

task 'build.resume.html', (options) ->
   console.log 'build.resume.html'
   setOutputDirByOption options.output
   builder.build.resume.html()

task 'build.blogs', (options) ->
  console.log 'build.blogs'
  setOutputDirByOption options.output
  builder.build.blogs()

task 'build.resume.pdf', (options) ->
  console.log 'build.resume.pdf'
  setOutputDirByOption options.output
  builder.build.resume.pdf()

task 'build.assets.style', (options) ->
  setOutputDirByOption options.output
  console.log 'build.assets.style'
  builder.build.assets.style()

task 'build.assets.images', (options) ->
  setOutputDirByOption options.output
  console.log 'build.assets.images'
  builder.build.assets.images()

task 'build', (options) ->
  invoke('build.index')
  invoke('build.readme')
  invoke('build.resume.html')
  invoke('build.blogs')
  invoke('build.resume.pdf')
  invoke('build.assets.style')
  invoke('build.assets.images')

task 'server', (options) ->
 console.log 'server'
 builder.server()

task 'build_serve', (options) ->
  invoke('build')
  invoke('server')
