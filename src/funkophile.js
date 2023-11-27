const $$$ = require('reselect').createSelector;
const puppeteer = require('puppeteer');
const lwip = require("@randy.tarampi/lwip");

const blogEntries = require("./blogEntries/funkophile.js");
const styleFunkophile = require("./stylesheets/funkophile.js")
const pagesFunkophile = require("./pages/funkophile.js");
const projectFunkyBundle = require("./projects/funkybundle/funkophile.js");

const {
  contentOfFile,
  contentsOfFiles,
  srcAndContentOfFile,
  srcAndContentOfFiles
} = require("../funkophile/funkophileHelpers.js");

const CONTACTS = 'CONTACTS'
const FAVICON_PNG = 'FAVICON_PNG'
const JPG = 'JPG'
const JPG_TRANSFORMS = 'JPG_TRANSFORMS'
const JS = 'JS'
const LICENSE = 'LICENSE';
const PDF_SETTINGS = 'PDF_SETTINGS'
const RESUME = 'RESUME';

const makeResumePdf = (resumeContent, css, pdfSettings) => {
  return (async () => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(resumeContent)

      await page.addStyleTag({
        content: css
      })
      const pdf = await page.pdf({
        path: '/dev/null',
        ...JSON.parse(pdfSettings)
      });
      await browser.close();

      // clear the timestamp for deterministic pdfs
      for (const offset of [97, 98, 99, 100, 132, 133, 134, 135]) {
        pdf[offset] = 0;
      }
      return pdf
    } catch (e) {
      console.error(e);
      return e;
    } finally {
      // console.log('We do cleanup here');
    }

  })();
};

const jpgTransformPromises = (jpgs, assets) => {
  return Object.keys(jpgs)
    .reduce((mm, jKey) => {
      const shortFileName = jKey.split('/')[3]
      mm[jKey.split('/').slice(-2).join('/')] = jpgs[jKey]
      const transformations = JSON.parse(assets)[shortFileName]
      if (transformations) {

        Object.keys(transformations).forEach((transformationKey) => {

          mm['images/' + transformationKey + '-' + shortFileName] = new Promise((res, rej) => lwip.open(jpgs[jKey], 'jpg', (err, image) => {

            const batchImage = image.batch()
            transformations[transformationKey].forEach((transform) => {
              ts = Object.keys(transform)[0]
              args = transform[ts]
              if (args.length) {
                batchImage[ts](...transform[ts])
              } else {
                batchImage[ts](transform[ts])
              }
            });

            batchImage.toBuffer('jpg', {}, (err, buffer) => {
              res(buffer)
            })
          }))

        }, {})

      }
      return mm;
    }, {})
};

module.exports = {

  inputs: {
    [CONTACTS]: 'contacts.json',
    [FAVICON_PNG]: 'images/evilShroom.png',
    [JPG]: 'images/*.jpg',
    [JS]: 'index.js',
    [LICENSE]: 'LICENSE.txt',
    [PDF_SETTINGS]: 'pdfSettings.json',
    [RESUME]: 'resume.md',
    [JPG_TRANSFORMS]: 'images/assets.json',

    ...styleFunkophile.inputs,
    ...pagesFunkophile.inputs,
    ...blogEntries.inputs,
    ...projectFunkyBundle.inputs,
  },

  outputs: (_) => {

    const blogSelector = blogEntries.outputs(_);
    const cssSelector = styleFunkophile.outputs(_);
    const pageSelectors = pagesFunkophile.outputs(_);
    const projectFunkyBundleSelectors = projectFunkyBundle.outputs(_);

    const $resume = contentOfFile(_["RESUME"]);
    const $js = contentOfFile(_["JS"]);
    const $favicon = contentOfFile(_["FAVICON_PNG"]);
    const $license = contentOfFile(_["LICENSE"]);

    const $resumeMarkdown = $$$($resume, markdown.parse);

    const $resumePdf = $$$(
      [
        $resumeMarkdown,
        cssSelector.$pdfCss,
        contentOfFile(_["PDF_SETTINGS"]),
      ],
      (resumeMarkdown, css, pdfSettings) => makeResumePdf(resumeMarkdown.content, css, pdfSettings))
    return {
      $pages: pageSelectors,
      ...blogSelector,

      $resume,
      $js,
      $favicon,
      $resumeMarkdown,

      $content: $$$([pageSelectors, blogSelector.$blog, $resumeMarkdown, $$$(contentOfFile(_["CONTACTS"]), (contactsString) => JSON.parse(contactsString).map((c) => {
        return {
          'type': Object.keys(c)[0],
          'content': c[Object.keys(c)[0]],
          'icon': simpleIcons.get(Object.keys(c)[0]).svg
        }
      }))], (p, b, r, c) => {
        return {
          pages: p,
          blog: b,
          resume: r,
          contacts: c
        }

      }),

      $all: $$$([
        projectFunkyBundleSelectors.$bundle,
        $resume, $favicon, $js, $license, $resumePdf, cssSelector.$webCss, blogSelector.$allBlogAssets,
        $$$(
          [_.JPG, contentOfFile(_["JPG_TRANSFORMS"])], jpgTransformPromises
        ),
      ], (
        fb, r, f, j, l, rsmPdf, css, allBlogAssets, jpgs
      ) => {
        return {
          'resume.md': r,
          'favicon.png': f,
          'index.js': j,
          'LICENSE.txt': l,
          'resume.pdf': rsmPdf,
          'style.css': css,
          ...allBlogAssets,
          ...jpgs,
          ...fb,
        }
      })

    }
  }
}