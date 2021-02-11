cheerio = require("cheerio");
CleanCSS = require('clean-css');
fs = require('fs');
jade = require("jade");
lwip = require("js-lwip");
moment = require('moment');
puppeteer = require('puppeteer');
simpleIcons = require('simple-icons');
slug = require('slug');

module.exports = {

	jadeRender: (content, pageLayout, locals) => {
		return jade.render(content, {
			filename: pageLayout.src,
			...locals
		})
	},

	jadeRenderPageLayout: (content, pageLayout, locals) => {
		return jade.render(pageLayout.content, {
			filename: pageLayout.src,
			page: {
				content: content
			},
			...locals
		})
	},

	jadeRenderBlogEntry: (blogEntry, blogEntryLayout, locals) => {
		return jade.render(blogEntryLayout.content, {
			filename: blogEntryLayout.src,
			entry: blogEntry,
			page: {
				content: blogEntry.markdownContent,
			},
			...locals
		})
	}


}
