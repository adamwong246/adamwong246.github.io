import * as cheerio from 'cheerio';
import moment from 'moment';
import markdown from 'marky-mark';
import reselect from 'reselect';
import slug from 'slug';
import fs from 'fs';

import assets from '../images/assets';

import {Jimp} from 'jimp'; // Import types
import { srcAndContentOfFiles } from '../../funkophile/funkophileHelpers';

const $$$ = reselect.createSelector;

// Import the sort order from songsOfSol.json
const songsOfSolOrder = JSON.parse(
	fs.readFileSync('./src/songsOfSol.json', 'utf8'),
).entryOrder;

// One key for every file input pattern
const BLOG_ASSETS = 'BLOG_ASSETS';
const BLOG_ENTRIES = 'BLOG_ENTRIES';
const BLOG_ENTRIES_JPGS = 'BLOG_ENTRIES_JPGS';
const BLOG_ENTRIES_GIFS = 'BLOG_ENTRIES_GIFS';
const BLOG_ENTRIES_MOVS = 'BLOG_ENTRIES_MOVS';
const BLOG_ENTRIES_PNGS = 'BLOG_ENTRIES_PNGS';
const BLOG_ENTRIES_RAW = 'BLOG_ENTRIES_RAW';

const transformJpegs = (jpgs: any[], blogEntries: any[]) => {
    console.log('transformJpegs called with', jpgs.length, 'jpgs');
    const result: Record<string, Promise<Buffer>> = {};
    for (const jpg of jpgs) {
        const src = jpg.src;
        const jpgSplit = src.split('/');
        const blogEntry = blogEntries.find((b: {srcFolder: any}) => src.includes(b.srcFolder));
        if (blogEntry) {
            const fileName = jpgSplit[jpgSplit.length - 1];
            const baseName = fileName.split('.')[0];
            const extension = fileName.split('.')[1];
            const optimizedFileName = `${baseName}-optimized.${extension}`;
            const destFolder = blogEntry.destFolder.endsWith('/') ? blogEntry.destFolder : blogEntry.destFolder + '/';
            const newKey = destFolder + optimizedFileName;
            
            console.log('Blog image:', fileName, '->', newKey);
            
            // Check if we have transformations for this image
            console.log('TRANSFORM_DEBUG: fileName=', fileName);
            console.log('TRANSFORM_DEBUG: assets keys=', Object.keys(assets));
            const imageTransformations = (assets as any)[fileName];
            console.log('TRANSFORM_DEBUG: imageTransformations=', imageTransformations);
            if (imageTransformations && imageTransformations.optimized) {
                console.log('TRANSFORM_DEBUG: Found optimized transformation');
                // Create a promise that will resolve to the transformed image
                result[newKey] = new Promise((resolve, reject) => {
                    Jimp.read(jpg.content).then(image => {
                        console.log('TRANSFORM_DEBUG: Original dimensions:', image.bitmap.width, 'x', image.bitmap.height);
                        let currentImage = image;
                        // Apply transformation(s)
                        const optimizedTransform = imageTransformations.optimized;
                        console.log('TRANSFORM_DEBUG: optimizedTransform type:', typeof optimizedTransform);
                        if (Array.isArray(optimizedTransform)) {
                            for (const transform of optimizedTransform) {
                                currentImage = transform(currentImage);
                            }
                        } else if (typeof optimizedTransform === 'function') {
                            currentImage = optimizedTransform(currentImage);
                            console.log('TRANSFORM_DEBUG: After transform dimensions:', currentImage.bitmap.width, 'x', currentImage.bitmap.height);
                        } else {
                            console.warn('TRANSFORM_DEBUG: No valid transformation found for', fileName);
                            resolve(jpg.content);
                            return;
                        }
                        currentImage.getBuffer(Jimp.MIME_JPEG, { quality: 85 }, (err, buffer) => {
                            if (err) {
                                console.error('Error transforming image:', err);
                                // Fall back to original content
                                resolve(jpg.content);
                            } else {
                                console.log('TRANSFORM_DEBUG: Buffer size original=', jpg.content.length, 'optimized=', buffer.length);
                                resolve(buffer);
                            }
                        });
                    }).catch(err => {
                        console.error('Error reading image with Jimp:', err);
                        resolve(jpg.content);
                    });
                });
            } else {
                console.log('TRANSFORM_DEBUG: No transformation found, using original');
                // No transformations defined, use original content
                result[newKey] = Promise.resolve(jpg.content);
            }
        }
    }
    console.log('transformJpegs returning result with keys:', Object.keys(result));
    return result;
};

const updateBlogImagePaths = (
	blogEntries: any[],
	jpgs: {},
	gifs: {},
	movs: any,
	pngs: {},
	rawAssets: {},
) => {
	return blogEntries.map((blogEntry: {markdownContent: any}) => {
		const blogEntryHtmlString = blogEntry.markdownContent;
		const $ = cheerio.load(blogEntryHtmlString);

		[
			...Object.keys(jpgs),
			...Object.keys(gifs),
			...Object.keys(pngs),
			...Object.keys(rawAssets),
		].forEach(key => {
			const split = key.split('/');
			const last = split[split.length - 1];

			// For JPEGs, try to use optimized version if available
			if (key.endsWith('.jpg') && !key.includes('-optimized')) {
				// Look for optimized version
				const baseName = last.split('.')[0];
				const extension = last.split('.')[1];
				const optimizedLast = `${baseName}-optimized.${extension}`;
				// Check all asset keys for the optimized version
				const allKeys = [...Object.keys(jpgs), ...Object.keys(gifs), ...Object.keys(pngs), ...Object.keys(rawAssets)];
				const optimizedKey = allKeys.find(k => k.endsWith(optimizedLast));
				if (optimizedKey) {
					$(':root').find(`img[src="${last}"]`).attr('src', `/${optimizedKey}`);
					$(':root').find(`a[href="${last}"]`).attr('href', `/${optimizedKey}`);
				} else {
					$(':root').find(`img[src="${last}"]`).attr('src', `/${key}`);
					$(':root').find(`a[href="${last}"]`).attr('href', `/${key}`);
				}
			} else {
				$(':root').find(`img[src="${last}"]`).attr('src', `/${key}`);
				$(':root').find(`a[href="${last}"]`).attr('href', `/${key}`);
			}
		});

		return {
			...blogEntry,
			markdownContent: $.html(),
			images: {jpgs, gifs, movs},
		};
	});
};

const processBlogEntries = (blogEntries: any[]) => {
	// Use the imported sort order
	const customOrder = songsOfSolOrder;

	const processedEntries = blogEntries
		.map((blogEntry: {content: any; src: string}) => {
			const markdownContent = markdown.parse(blogEntry.content);
			const entryId = blogEntry.src.split('/').slice(-2, -1)[0];
			const slugPath =
				'blog/' + entryId + '-' + slug(markdownContent.meta.title) + '/';
			const filePath = slugPath + 'index.html';
			return {
				meta: markdownContent.meta,
				markdownContent: markdownContent.content,
				dest: filePath,
				url: `/${filePath}`,
				destFolder: slugPath,
				srcFolder: blogEntry.src.split('index.md')[0],
				entryId,
			};
		})
		.filter((a: {meta: {published: boolean}}) => a.meta.published !== false);

	// Sort entries according to custom order
	const sortedEntries = processedEntries.sort(
		(
			a: {entryId: any; meta: {publishedAt: moment.MomentInput}},
			b: {entryId: any; meta: {publishedAt: moment.MomentInput}},
		) => {
			const aIndex = customOrder.indexOf(a.entryId);
			const bIndex = customOrder.indexOf(b.entryId);

			// If both are in custom order, sort by their position in the custom order
			if (aIndex !== -1 && bIndex !== -1) {
				return aIndex - bIndex;
			}
			// If only a is in custom order, it comes first
			if (aIndex !== -1) return -1;
			// If only b is in custom order, it comes first
			if (bIndex !== -1) return 1;
			// If neither are in custom order, sort by date (newest first)
			return moment(b.meta.publishedAt).diff(moment(a.meta.publishedAt));
		},
	);

	return sortedEntries.map(
		(
			lmnt: {
				meta: {
					previous: {url: any; title: any} | null;
					next: {url: any; title: any} | null;
				};
			},
			ndx: number,
			ry: string | any[],
		) => {
			if (ndx === ry.length - 1) {
				lmnt.meta.previous = null;
			} else {
				const previous = ry[ndx + 1];
				lmnt.meta.previous = {
					url: previous.url,
					title: previous.meta.title,
				};
			}

			if (ndx === 0) {
				lmnt.meta.next = null;
			} else {
				const next = ry[ndx - 1];
				lmnt.meta.next = {
					url: next.url,
					title: next.meta.title,
				};
			}

			return lmnt;
		},
	);
};

export default {
	// defines the inputs points where files will be read and their key within the Redux store
	inputs: {
		[BLOG_ENTRIES_GIFS]: 'blogEntries/**/*.gif',
		[BLOG_ENTRIES_JPGS]: 'blogEntries/**/*.jpg',
		[BLOG_ENTRIES_MOVS]: 'blogEntries/**/*.mov',
		[BLOG_ENTRIES_PNGS]: 'blogEntries/**/*.png',
		[BLOG_ENTRIES]: 'blogEntries/**/index.md',

		[BLOG_ENTRIES_RAW]: 'blogEntries/**/raw/*',
	},

	// return a selector based on the given selector '_'
	outputs: (_: {
		[x: string]: (state: any) => Record<string, string | Buffer>;
	}) => {
		const $blogEntries = $$$(
			srcAndContentOfFiles(_[BLOG_ENTRIES]),
			processBlogEntries,
		);

		//   const $blogEntriesRaw = $$$([srcAndContentOfFiles(_[BLOG_ENTRIES_RAW]), $blogEntries],
		//   (gifs, blogEntries) => gifs.reduce((mm, gif) => {
		//     const src = gif.src
		//     const gifSplit = src.split('/')
		//     return {
		//       ...mm,
		//       [blogEntries.find((b) => src.includes(b.srcFolder)).destFolder + gifSplit[gifSplit.length - 1]]: gif.content
		//     }
		//   }, {})
		// );

		const $blogEntriesGifs = $$$(
			[srcAndContentOfFiles(_[BLOG_ENTRIES_GIFS]), $blogEntries],
			(gifs, blogEntries) =>
				gifs.reduce((mm: any, gif: {src: any; content: any}) => {
					const src = gif.src;
					const gifSplit = src.split('/');
					return {
						...mm,
						[blogEntries.find((b: {srcFolder: any}) =>
							src.includes(b.srcFolder),
						).destFolder + gifSplit[gifSplit.length - 1]]: gif.content,
					};
				}, {}),
		);

		const $blogEntriesMovs = $$$(
			[srcAndContentOfFiles(_[BLOG_ENTRIES_MOVS]), $blogEntries],
			(movs, blogEntries) =>
				movs.reduce((mm: any, mov: {src: any; content: any}) => {
					const src = mov.src;
					const movSplit = src.split('/');
					return {
						...mm,
						[blogEntries.find((b: {srcFolder: any}) =>
							src.includes(b.srcFolder),
						).destFolder + movSplit[movSplit.length - 1]]: mov.content,
					};
				}, {}),
		);

		const $blogEntriesPngs = $$$(
			[srcAndContentOfFiles(_[BLOG_ENTRIES_PNGS]), $blogEntries],
			(pngs, blogEntries) =>
				pngs.reduce((mm: any, png: {src: any; content: any}) => {
					const src = png.src;
					const pngSplit = src.split('/');
					return {
						...mm,
						[blogEntries.find((b: {srcFolder: any}) =>
							src.includes(b.srcFolder),
						).destFolder + pngSplit[pngSplit.length - 1]]: png.content,
					};
				}, {}),
		);

		const $blogEntriesJpgsOrginal = $$$(
			[srcAndContentOfFiles(_[BLOG_ENTRIES_JPGS]), $blogEntries],
			(jpgs, blogEntries) =>
				jpgs.reduce((mm: any, jpg: {src: any; content: any}) => {
					const src = jpg.src;
					const jpgSplit = src.split('/');
					return {
						...mm,
						[blogEntries.find((b: {srcFolder: any}) =>
							src.includes(b.srcFolder),
						).destFolder + jpgSplit[jpgSplit.length - 1]]: jpg.content,
					};
				}, {}),
		);

		const $blogEntriesJpgsModified = $$$(
			[
				srcAndContentOfFiles(_[BLOG_ENTRIES_JPGS]),
				$blogEntries,
			],
			transformJpegs,
		);

		const $blogEntriesRaw = $$$(
			[srcAndContentOfFiles(_[BLOG_ENTRIES_RAW]), $blogEntries],
			(rawAssets, blogEntries) =>
				rawAssets.reduce((mm: any, raw: {src: any; content: any}) => {
					const src = raw.src;
					const rawSplit = src.split('/');
					return {
						...mm,
						[blogEntries.find((b: {srcFolder: any}) =>
							src.includes(b.srcFolder),
						).destFolder + rawSplit[rawSplit.length - 1]]: raw.content,
					};
				}, {}),
		);

		return {
			$allBlogAssets: $$$(
				[
					$blogEntriesGifs,
					$blogEntriesMovs,
					$blogEntriesJpgsOrginal,
					$blogEntriesJpgsModified,
					$blogEntriesPngs,
					$blogEntriesRaw,
				],
				(gifs, movs, jpgOrginals, jpgModifieds, pngs, rawAssets) => {
					return {
						...gifs,
						...jpgModifieds,
						...jpgOrginals,
						...movs,
						...pngs,
						...rawAssets,
					};
				},
			),

			$blog: $$$(
				[
					$blogEntries,
					$$$(
						[$blogEntriesJpgsOrginal, $blogEntriesJpgsModified],
						(originals, modifed) => {
							return {
								...originals,
								...modifed,
							};
						},
					),
					$blogEntriesGifs,
					$blogEntriesMovs,
					$blogEntriesPngs,
					$blogEntriesRaw,
				],
				updateBlogImagePaths,
			),
		};
	},
};
