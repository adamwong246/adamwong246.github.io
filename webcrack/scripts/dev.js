// const webcrackConfig = require('../../webcrack.config.js')
// const watch = require('watch');
//
// const construct  = require("../lib/construct.js");
// const { readfile } = require("../lib/utils.js");
// const dispatch = require("../lib/dispatch.js");
//
// // const watchAndDispatch = (store, key, path, glob) => {
// //   console.log('watchAndDispatch', key, path, glob);
// //
// //   watch.createMonitor(path, function(monitor) {
// //     monitor.files[glob];
// //
// //     monitor.on('created', function(f, stat) {
// //       console.log(`${key} created: ` + './' + f)
// //       dispatch(store, key, './' + f);
// //     });
// //
// //     monitor.on('changed', function(f, curr, prev) {
// //       console.log(`${key} changed: ` + './' + f)
// //       dispatch(store, key, './' + f);
// //     });
// //
// //     // monitor.on('removed', function(f, stat) {
// //     //   console.log('page removed: ' + f)
// //     //   store.dispatch({
// //     //     type: 'REMOVED',
// //     //     payload: f
// //     //   })
// //   });
// //   // process.exit(0)
// // };
//
// const multiWatch = (store, key, filePicker, options) => {
//   if (typeof filePicker === 'string') {
//     watchAndDispatch(store, key, './' + options.inFolder,  './' + options.inFolder + "/" + filePicker)
//   } else if (Array.isArray(filePicker)) {
//     // listDispatch(store, filePicker, options, key)
//   } else {
//     // objectDispatch(store, filePicker, options, key)
//   }
// };
//
// construct(webcrackConfig, (store, inputRule, options) => {
//   console.log('dev.js construct')
//   console.log(inputRule)
//
//   multiWatch(store, inputRule.key, inputRule.filePicker, options)
// })
