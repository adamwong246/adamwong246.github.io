#= require vendor/jquery-2.0.3
#= require vendor/wiselinks-1.1.2

$(document).ready ->
    window.wiselinks = new Wiselinks()

$(document).on 'page:fetch', ->
  $('#content').fadeOut 'slow'

$(document).on 'page:restore', ->
  $('#content').fadeIn 'slow'    