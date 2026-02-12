import { Jimp, JimpInstance } from "jimp";
import { JimpMime } from 'jimp'; // Import types
import reselect from "reselect"
import path from "path"

import {
  contentOfFile,
} from "../funkophile/funkophileHelpers";

import styleFunkophile from "./stylesheets/funkophile.js";
import pagesFunkophile from "./pages/funkophile.js";
import blogFunkophile from "./blogEntries/funkophile.js";
import assets from "./images/assets";

const $$$ = reselect.createSelector;

const FAVICON_PNG = 'FAVICON_PNG'
const JPG = 'JPG'
const JS = 'JS'
const LICENSE = 'LICENSE';
const PDF_SETTINGS = 'PDF_SETTINGS'
const FONTS = 'FONTS'
const FONT_MPLUS_BOLD = 'FONT_MPLUS_BOLD'
const FONT_RALEWAY_REGULAR = 'FONT_RALEWAY_REGULAR'

const jpgTransformPromises = (jpgs) => {
  return Object.keys(jpgs)
    .reduce((mm, jKey) => {
      const shortFileName = path.basename(jKey)
      mm[jKey.split('/').slice(-2).join('/')] = jpgs[jKey]

      const transformations: Record<string, (image: any) => any> = (assets as any)[shortFileName]

      if (transformations && typeof transformations === 'object') {

        Object.keys(transformations).forEach((transformationKey) => {

          mm['images/' + transformationKey + '-' + shortFileName] = new Promise((res, rej) => {

            Jimp.read(jpgs[jKey]).then(image => {
              try {
                // Get the transformation function
                const transformFunc = transformations[transformationKey];

                if (typeof transformFunc !== 'function') {
                  throw new Error(`Transformation ${transformationKey} for ${shortFileName} is not a function`);
                }

                // Apply the transformation
                const transformedImage: JimpInstance = transformFunc(image);

                // Check if the result is valid
                if (!transformedImage || typeof transformedImage.getBuffer !== 'function') {
                  throw new Error(`Transformation for ${shortFileName} did not return a valid Jimp image`);
                }

                res(transformedImage.getBuffer(JimpMime.jpeg, {}))
              } catch (error) {
                console.error("Error during transformation:", error);
                // Resolve with original content instead of exiting
                res(jpgs[jKey]);
              }
            }).catch(err => {
              console.error("Error reading image:", err);
              // Resolve with original content instead of exiting
              res(jpgs[jKey]);
            });
          });

        }, {})

      }
      return mm;
    }, {})
};

export default {

  inputs: {
    [FAVICON_PNG]: 'images/evilShroom.png',
    [JPG]: 'images/*.jpg',
    [JS]: 'index.js',
    [LICENSE]: 'LICENSE.txt',
    [PDF_SETTINGS]: 'pdfSettings.json',
    [FONT_MPLUS_BOLD]: 'fonts/M_PLUS_Rounded_1c/MPLUSRounded1c-Bold.ttf',
    [FONT_RALEWAY_REGULAR]: 'fonts/Raleway/static/Raleway-Regular.ttf',

    ...styleFunkophile.inputs,
    ...pagesFunkophile.inputs,
    ...blogFunkophile.inputs,
  },

  outputs: (_) => {

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
      $content: $$$([
        pageSelectors,
        blogSelector.$blog,
        // $$$(contentOfFile(_["CONTACTS"]), (contactsString) => JSON.parse(contactsString).map((c) => {
        //   return {
        //     'type': Object.keys(c)[0],
        //     'content': c[Object.keys(c)[0]],
        //     // 'icon': simpleIcons.get(Object.keys(c)[0]).svg
        //   }
        // }))
      ], (p, b, r, c) => {


        return {
          pages: p,
          blog: b,
          // contacts: c
        }

      }),

      $all: $$$([
        $favicon,
        $js,
        $license,
        cssSelector.$webCss,
        blogSelector.$allBlogAssets,
        $$$(
          [_.JPG], jpgTransformPromises
        ),
        contentOfFile(_["FONT_MPLUS_BOLD"]),
        contentOfFile(_["FONT_RALEWAY_REGULAR"]),
      ], (
        f,
        j,
        l,
        css,
        allBlogAssets,
        jpgs,
        fontMplusBold,
        fontRalewayRegular
      ) => {
        return {
          'favicon.png': f,
          'index.js': j,
          'LICENSE.txt': l,
          'style.css': css,
          ...allBlogAssets,
          ...jpgs,
          'fonts/MPLUSRounded1c-Bold.ttf': fontMplusBold,
          'fonts/Raleway-Regular.ttf': fontRalewayRegular,
        }
      }),

      $resumePdfCss: cssSelector.$resumePdfCss,
      $resumeHtmlCss: cssSelector.$resumeHtmlCss

    }
  }
}
