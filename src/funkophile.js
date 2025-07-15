import simpleIcons from 'simple-icons';
import { Jimp } from "jimp";
import reselect from "reselect"
import path from "path"

import {
  contentOfFile,
} from "funkophile/funkophileHelpers";

import styleFunkophile from "./stylesheets/funkophile.js";
import pagesFunkophile from "./pages/funkophile.js";
import blogFunkophile from "./blogEntries/funkophile.js";

const $$$ = reselect.createSelector;

const CONTACTS = 'CONTACTS'
const FAVICON_PNG = 'FAVICON_PNG'
const JPG = 'JPG'
const JPG_TRANSFORMS = 'JPG_TRANSFORMS'
const JS = 'JS'
const LICENSE = 'LICENSE';
const PDF_SETTINGS = 'PDF_SETTINGS'
const FONTS = 'FONTS'

const jpgTransformPromises = (jpgs, assets) => {
  return Object.keys(jpgs)
    .reduce((mm, jKey) => {
      const shortFileName = path.basename(jKey)
      mm[jKey.split('/').slice(-2).join('/')] = jpgs[jKey]
      const transformations = JSON.parse(assets)[shortFileName]
      if (transformations) {

        Object.keys(transformations).forEach((transformationKey) => {

          mm['images/' + transformationKey + '-' + shortFileName] = new Promise((res, rej) => Jimp.open(jpgs[jKey], 'jpg', (err, image) => {

            if (err) {
              console.error(err)
              process.exit(-1)
            }

            const batchImage = image.batch()
            transformations[transformationKey].forEach((transform) => {
              const ts = Object.keys(transform)[0]
              const args = transform[ts]
              if (args.length) {
                batchImage[ts](...transform[ts])
              } else {
                batchImage[ts](transform[ts])
              }
            });

            batchImage.toBuffer('jpg', {}, (err2, buffer) => {
              if (err2) {
                console.error(err2)
                process.exit(-1)
              } else {
                res(buffer)
              }

            })
          }))

        }, {})

      }
      return mm;
    }, {})
};

export default {

  inputs: {
    [CONTACTS]: 'contacts.json',
    [FAVICON_PNG]: 'images/evilShroom.png',
    [JPG]: 'images/*.jpg',
    [JS]: 'index.js',
    [LICENSE]: 'LICENSE.txt',
    [PDF_SETTINGS]: 'pdfSettings.json',
    [JPG_TRANSFORMS]: 'images/assets.json',
    // [FONTS]: 'fonts/**/*',

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
        $$$(contentOfFile(_["CONTACTS"]), (contactsString) => JSON.parse(contactsString).map((c) => {
          return {
            'type': Object.keys(c)[0],
            'content': c[Object.keys(c)[0]],
            'icon': simpleIcons.get(Object.keys(c)[0]).svg
          }
        }))], (p, b, r, c) => {


          return {
            pages: p,
            blog: b,
            contacts: c
          }

        }),

      $all: $$$([
        $favicon,
        $js,
        $license,
        cssSelector.$webCss,
        blogSelector.$allBlogAssets,
        $$$(
          [_.JPG, contentOfFile(_["JPG_TRANSFORMS"])], jpgTransformPromises
        ),
      ], (
        f,
        j,
        l,
        css,
        allBlogAssets,
        jpgs
      ) => {
        return {
          'favicon.png': f,
          'index.js': j,
          'LICENSE.txt': l,
          'style.css': css,
          ...allBlogAssets,
          ...jpgs,
        }
      }),

      $resumePdfCss: cssSelector.$resumePdfCss,
      $resumeHtmlCss: cssSelector.$resumeHtmlCss

    }
  }
}