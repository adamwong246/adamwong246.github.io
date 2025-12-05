import moment from "moment";
import funkophile from "funkophile";
import * as cheerio from "cheerio";
import fs from "fs";

import reselect from "reselect";
const $$$ = reselect.createSelector;

import {
  contentOfFile,
  srcAndContentOfFile,
} from "funkophile/funkophileHelpers";

import {
  jadeRender,
  jadeRenderPageLayout,
  jadeRenderBlogEntry,
} from "./funkophileUtils";

import srcFunkophile from "./src/funkophile";

const NOT_FOUND_PAGE = "NOT_FOUND_PAGE";
const VIEWS = "VIEWS";

funkophile({
  mode: process.argv[2],
  initialState: {},

  options: {
    inFolder: "src",
    outFolder: "dist",
  },

  encodings: {
    utf8: ["md", "css", "jade", "txt", "json", "js"],
    "": ["jpg", "png", "gif", "mov"],
  },

  inputs: {
    ...srcFunkophile.inputs,
    [NOT_FOUND_PAGE]: "404.jade",
    [VIEWS]: "views/*.jade",
  },

  // return a selector based on the given selector '_'
  // the selector should return an object with keys for filenames and values of contents.
  // The contents can be a JSON-able, function or promise.

  outputs: (_: any) => {
    // const $packageDotJson = $$$(() => require("./packageDotJson.json"));
    const $packageDotJson = $$$(() => {
      const data = JSON.parse(fs.readFileSync("package.json").toString());
      return data;
    });

    const srcSelector = srcFunkophile.outputs(_);

    return $$$(
      [
        $$$(
          [
            $$$(
              [
                $packageDotJson,
                srcSelector.$content,
                srcAndContentOfFile(_[VIEWS], "./src/views/page.jade"),
                srcAndContentOfFile(
                  _[VIEWS],
                  "./src/views/blogEntryLayout.jade"
                ),
                contentOfFile(_[NOT_FOUND_PAGE]),
                // srcAndContentOfFile(_[VIEWS], './src/views/resume.jade'),
              ],
              (
                packageDotJson: any,
                content: any,
                pageLayout: any,
                blogEntryLayout: any,
                notFoundContent: any
                // resumeLayout
              ) => {
                const localsToJadeRender = {
                  packageDotJson,
                  blogEntries: content.blog,
                  // contacts: content.contacts,
                  pages: content.pages,
                  moment: moment,
                  cheerio: cheerio,
                  fs: fs,
                };

                return {
                  ...content.blog.reduce((mm: any, blogEntry: any) => {
                    return {
                      ...mm,
                      [blogEntry.dest]: jadeRenderBlogEntry(
                        blogEntry,
                        blogEntryLayout,
                        localsToJadeRender
                      ),
                    };
                  }, {}),
                  ...content.pages.reduce((mm: any, page: any) => {
                    return {
                      ...mm,
                      [page.dest]: jadeRender(
                        page.content,
                        pageLayout,
                        localsToJadeRender
                      ),
                    };
                  }, {}),
                  // 'resume.html': jadeRenderPageLayout(content.resume.content, resumeLayout, localsToJadeRender),
                };
              }
            ),
            srcSelector.$all,
          ],
          (
            html: any,

            srcAll: any
          ) => {
            return {
              ...srcAll,
              ...html,
              "README.md": fs.readFileSync("./README.md", "utf8"),
            };
          }
        ),

        srcAndContentOfFile(_[VIEWS], "./src/views/page.jade"),
        contentOfFile(_[NOT_FOUND_PAGE]),
        $packageDotJson,
        srcSelector.$content,
        srcSelector.$resumePdfCss,
        srcSelector.$resumeHtmlCss,
      ],
      (
        site: any,
        pageLayout: any,
        notFoundContent: any,
        packageDotJson: any,
        content: any,
        resumePdfCss: any,
        resumeHtmlCss: any
      ) => {
        return {
          ...site,
          "resume.html.css": resumeHtmlCss,
          "resume.pdf.css": resumePdfCss,
          "sitemap.html": `<ul>${Object.keys(site)
            .sort((e) => e)
            .map((e) => `<li><a href="/${e}"> ${e} </a></li>`)
            .join("")}</ul>`,
          "fuse.js": fs.readFileSync(
            "./node_modules/fuse.js/dist/fuse.min.js",
            "utf8"
          ),
          "404.html": jadeRender(notFoundContent, pageLayout, {
            blogEntries: content.blog,
            packageDotJson,
            paths: Object.keys(site),
          }),
        };
      }
    );
  },
});
