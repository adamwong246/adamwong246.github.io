_ = require("lodash");
memoize = require('memoizee');
glob = require("glob");
mm = require("marky-mark");
path = require('path');
slug = require("slug");
jade = require("jade");

packageJson = require("../package.json");

module.exports = function (assetPath) {
  return memoize(function() {
    var moment;
    return {
      "blogEntries": _.chain(_.map(glob.sync("src/blogEntries/*"), function(page) {
        var m;
        m = mm.parseFileSync(page + "/index.md");
        m.url = "/blog/" + (path.basename(page)) + "-" + (slug(m.meta.title));
        m.dest = m.url + "/index.html";
        m.src = page;
        m.assets = {
          "jpgs": glob.sync(m.src + "/*.jpg")
        };
        _.each(m.assets.jpgs, function(jpg) {
          return m.content = m.content.replace(path.basename(jpg), assetPath + m.url + "/" + path.basename(jpg));
        });
        return m;
      })).sortBy(function(n) {
        return new Date(n.meta.publishedAt);
      }).select(function(n) {
        return n.meta.publish !== false;
      }).value().reverse(),
      "pages": _.union(_.chain(glob.sync("src/pages/**/*.jade")).map(function(jadeFile) {
        var page;
        page = {};
        page.content = jade.renderFile(jadeFile);
        page.url = "/" + (jadeFile.replace('src/pages/', '').replace(/\.[^\/.]+$/, ''));
        page.dest = page.url + "/index.html";
        page.src = jadeFile;
        return page;
      }).value(), _.chain(glob.sync("src/pages/**/*.md")).map(function(markdownFile) {
        var m;
        m = mm.parseFileSync(markdownFile);
        m.url = "/" + (markdownFile.replace('src/pages/', '').replace(/\.[^\/.]+$/, ''));
        m.dest = m.url + "/index.html";
        m.src = markdownFile;
        m.assets = {
          "jpgs": glob.sync(m.src + "/*.jpg")
        };
        _.each(m.assets.jpgs, function(jpg) {
          return m.content = m.content.replace(path.basename(jpg), m.url + "/" + path.basename(jpg));
        });
        return m;
      }).select(function(n) {
        return n.meta.publish !== false;
      }).value()),
      "package": packageJson,
      "moment": moment = require("moment")
    };
  });
};
