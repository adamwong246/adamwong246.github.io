const $$$ = require('reselect').createSelector;
const {
	contentOfFile,
	contentsOfFiles,
	srcAndContentOfFile,
	srcAndContentOfFiles
} = require("../../../funkophile/funkophileHelpers.js");

const FUNKYBUNDLE_INDEX_JS = 'FUNKYBUNDLE_INDEX_JS';
const FUNKYBUNDLE_EXPERIMENT_0_HTML = 'FUNKYBUNDLE_EXPERIMENT_0_HTML';
const FUNKYBUNDLE_EXPERIMENT_1_HTML = 'FUNKYBUNDLE_EXPERIMENT_1_HTML';
const FUNKYBUNDLE_EXPERIMENT_2_HTML = 'FUNKYBUNDLE_EXPERIMENT_2_HTML';
const FUNKYBUNDLE_EXPERIMENT_3_HTML = 'FUNKYBUNDLE_EXPERIMENT_3_HTML';
const FUNKYBUNDLE_EXPERIMENT_4_HTML = 'FUNKYBUNDLE_EXPERIMENT_4_HTML';
const FUNKYBUNDLE_EXPERIMENT_5_HTML = 'FUNKYBUNDLE_EXPERIMENT_5_HTML';
const FUNKYBUNDLE_EXPERIMENT_2_JS = 'FUNKYBUNDLE_EXPERIMENT_2_JS';
const FUNKYBUNDLE_EXPERIMENT_3_JS = 'FUNKYBUNDLE_EXPERIMENT_3_JS';
const FUNKYBUNDLE_EXPERIMENT_4_JS = 'FUNKYBUNDLE_EXPERIMENT_4_JS';
const FUNKYBUNDLE_EXPERIMENT_5_JS = 'FUNKYBUNDLE_EXPERIMENT_5_JS';
const FUNKYBUNDLE_EXPERIMENT_5_JS_START = 'FUNKYBUNDLE_EXPERIMENT_5_JS_START';
const FUNKYBUNDLE_EXPERIMENT_5_JS_MODULES = 'FUNKYBUNDLE_EXPERIMENT_5_JS_MODULES';
const FUNKYBUNDLE_CIRCLE = 'FUNKYBUNDLE_CIRCLE';
const FUNKYBUNDLE_SQUARE = 'FUNKYBUNDLE_SQUARE';

module.exports = {

	inputs: {
		[FUNKYBUNDLE_INDEX_JS]: 'projects/funkybundle/index.js',
		[FUNKYBUNDLE_EXPERIMENT_0_HTML]: 'projects/funkybundle/experiment0.html',
		[FUNKYBUNDLE_EXPERIMENT_1_HTML]: 'projects/funkybundle/experiment1.html',
		[FUNKYBUNDLE_EXPERIMENT_2_HTML]: 'projects/funkybundle/experiment2.html',
		[FUNKYBUNDLE_EXPERIMENT_3_HTML]: 'projects/funkybundle/experiment3.html',
		[FUNKYBUNDLE_EXPERIMENT_4_HTML]: 'projects/funkybundle/experiment4.html',
    [FUNKYBUNDLE_EXPERIMENT_5_HTML]: 'projects/funkybundle/experiment5.html',
		[FUNKYBUNDLE_EXPERIMENT_2_JS]: 'projects/funkybundle/experiment2.js',
		[FUNKYBUNDLE_EXPERIMENT_3_JS]: 'projects/funkybundle/experiment3.js',
		[FUNKYBUNDLE_EXPERIMENT_4_JS]: 'projects/funkybundle/experiment4.js',
    [FUNKYBUNDLE_EXPERIMENT_5_JS]: 'projects/funkybundle/experiment5.js',
    [FUNKYBUNDLE_EXPERIMENT_5_JS]: 'projects/funkybundle/experiment5.js',
    [FUNKYBUNDLE_EXPERIMENT_5_JS_MODULES]: 'projects/funkybundle/funkybundleModules_experiment5.js',
    [FUNKYBUNDLE_EXPERIMENT_5_JS_START]: 'projects/funkybundle/funkybundleStart_experiment5.js',
		[FUNKYBUNDLE_CIRCLE]: 'projects/funkybundle/circle.js',
		[FUNKYBUNDLE_SQUARE]: 'projects/funkybundle/square.js',
	},

	outputs: (_) => {

    // const funkyBundledExperiment5 = funkyBundler();

		return {

			$bundle: $$$([
				contentOfFile(_["FUNKYBUNDLE_EXPERIMENT_0_HTML"]),
				contentOfFile(_["FUNKYBUNDLE_EXPERIMENT_1_HTML"]),
				contentOfFile(_["FUNKYBUNDLE_EXPERIMENT_2_HTML"]),
				contentOfFile(_["FUNKYBUNDLE_EXPERIMENT_3_HTML"]),
				contentOfFile(_["FUNKYBUNDLE_EXPERIMENT_4_HTML"]),
        contentOfFile(_["FUNKYBUNDLE_EXPERIMENT_5_HTML"]),
				contentOfFile(_["FUNKYBUNDLE_INDEX_JS"]),
				contentOfFile(_["FUNKYBUNDLE_CIRCLE"]),
				contentOfFile(_["FUNKYBUNDLE_SQUARE"]),

				contentOfFile(_["FUNKYBUNDLE_EXPERIMENT_2_JS"]),
				contentOfFile(_["FUNKYBUNDLE_EXPERIMENT_3_JS"]),
				contentOfFile(_["FUNKYBUNDLE_EXPERIMENT_4_JS"]),
        contentOfFile(_["FUNKYBUNDLE_EXPERIMENT_5_JS"]),
        contentOfFile(_["FUNKYBUNDLE_EXPERIMENT_5_JS_MODULES"]),
        contentOfFile(_["FUNKYBUNDLE_EXPERIMENT_5_JS_START"]),
			], (
				exp0, exp1, exp2, exp3, exp4, exp5,
				js, circle, square,
				expJs2, expJs3, expJs4, expJs5, expJsModules5, expJsStart5,
			) => {
				return {
					'projects/funkybundle/experiment0.html': exp0,
					'projects/funkybundle/experiment1.html': exp1,
					'projects/funkybundle/experiment2.html': exp2,
					'projects/funkybundle/experiment3.html': exp3,
          'projects/funkybundle/experiment4.html': exp4,
          'projects/funkybundle/experiment5.html': exp5,

					'projects/funkybundle/funkybundled.js': js,
					'projects/funkybundle/circle.js': circle,
					'projects/funkybundle/square.js': square,

					'projects/funkybundle/experiment2.js': expJs2,
					'projects/funkybundle/experiment3.js': expJs3,
          'projects/funkybundle/experiment4.js': expJs4,
          'projects/funkybundle/experiment5.js': expJs5,
          'projects/funkybundle/funkybundleStart_experiment5.js': expJsStart5,
          'projects/funkybundle/funkybundleModules_experiment5.js': expJsModules5,
				}
			})

		}
	}
}
