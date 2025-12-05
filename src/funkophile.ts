// import simpleIcons from "simple-icons";
import { Jimp } from "jimp";
import reselect from "reselect";
import path from "path";

import { contentOfFile } from "funkophile/funkophileHelpers";

import styleFunkophile from "./stylesheets/funkophile";
import pagesFunkophile from "./pages/funkophile";
import blogFunkophile from "./blogEntries/funkophile";

const $$$ = reselect.createSelector;

const FAVICON_PNG = "FAVICON_PNG";
const JPG = "JPG";
const JPG_TRANSFORMS = "JPG_TRANSFORMS";
const JS = "JS";
const LICENSE = "LICENSE";
const PDF_SETTINGS = "PDF_SETTINGS";
const FONTS = "FONTS";
const FONT_MPLUS_BOLD = "FONT_MPLUS_BOLD";
const FONT_RALEWAY_REGULAR = "FONT_RALEWAY_REGULAR";

const jpgTransformPromises = (jpgs: any, assets: any) => {
  return Object.keys(jpgs).reduce((mm: any, jKey: string) => {
    const shortFileName = path.basename(jKey);
    mm[jKey.split("/").slice(-2).join("/")] = jpgs[jKey];
    const transformations = JSON.parse(assets)[shortFileName];
    if (transformations) {
      Object.keys(transformations).forEach((transformationKey: string) => {
        mm["images/" + transformationKey + "-" + shortFileName] = new Promise(
          async (res, rej) => {
            const j = await Jimp.read(jpgs[jKey]);
          }
        );
      });
    }
    return mm;
  }, {});
};

export default {
  inputs: {
    [FAVICON_PNG]: "images/evilShroom.png",
    [JPG]: "images/*.jpg",
    [JS]: "index.js",
    [LICENSE]: "LICENSE.txt",
    [PDF_SETTINGS]: "pdfSettings.json",
    [JPG_TRANSFORMS]: "images/assets.json",
    [FONT_MPLUS_BOLD]: "fonts/M_PLUS_Rounded_1c/MPLUSRounded1c-Bold.ttf",
    [FONT_RALEWAY_REGULAR]: "fonts/Raleway/static/Raleway-Regular.ttf",

    ...styleFunkophile.inputs,
    ...pagesFunkophile.inputs,
    ...blogFunkophile.inputs,
  },

  outputs: (_: any) => {
    const blogSelector = blogFunkophile.outputs(_);
    const cssSelector = styleFunkophile.outputs(_);
    const pageSelectors = pagesFunkophile.outputs(_);

    const $js = contentOfFile(_["JS"]);
    const $favicon = contentOfFile(_["FAVICON_PNG"]);
    const $license = contentOfFile(_["LICENSE"]);

    return {
      $pages: pageSelectors,
      ...blogSelector,
      $js,
      $favicon,
      $content: $$$(
        [
          pageSelectors,
          blogSelector.$blog,
          // $$$(contentOfFile(_["CONTACTS"]), (contactsString) => JSON.parse(contactsString).map((c) => {
          //   return {
          //     'type': Object.keys(c)[0],
          //     'content': c[Object.keys(c)[0]],
          //     // 'icon': simpleIcons.get(Object.keys(c)[0]).svg
          //   }
          // }))
        ],
        (p: any, b: any, r: any, c: any) => {
          return {
            pages: p,
            blog: b,
            // contacts: c
          };
        }
      ),

      $all: $$$(
        [
          $favicon,
          $js,
          $license,
          cssSelector.$webCss,
          blogSelector.$allBlogAssets,
          $$$(
            [_.JPG, contentOfFile(_["JPG_TRANSFORMS"])],
            jpgTransformPromises
          ),
          contentOfFile(_["FONT_MPLUS_BOLD"]),
          contentOfFile(_["FONT_RALEWAY_REGULAR"]),
        ],
        (
          f: any,
          j: any,
          l: any,
          css: any,
          allBlogAssets: any,
          jpgs: any,
          fontMplusBold: any,
          fontRalewayRegular: any
        ) => {
          return {
            "favicon.png": f,
            "index.js": j,
            "LICENSE.txt": l,
            "style.css": css,
            ...allBlogAssets,
            ...jpgs,
            "fonts/MPLUSRounded1c-Bold.ttf": fontMplusBold,
            "fonts/Raleway-Regular.ttf": fontRalewayRegular,
          };
        }
      ),

      $resumePdfCss: cssSelector.$resumePdfCss,
      $resumeHtmlCss: cssSelector.$resumeHtmlCss,
    };
  },
};
