const glob = require("glob");
const dispatch = require("./dispatch.js")
const watch = require('watch');

// const stringDispatch = (store, filePicker, options, key) => {
//   watch.createMonitor( './' + options.inFolder, function(monitor) {
//     monitor.files['./' + options.inFolder +'/' + filePicker]
//     monitor.on('changed', function(f, curr, prev) {
//       console.log(`${key} - file changed: `, f)
//       dispatch(store, key, './' + f);
//     });
//   });
//   dispatch(store, key, `./${options.inFolder}/${filePicker}`);
// };
//
// const objectDispatch = (store, filePicker, options, key) =>
//   glob.sync(`./${options.inFolder}/${filePicker.filepath}/${filePicker.fileglob}`)
//   .map((file) => dispatch(store, key, file));
//
// const listDispatch = (store, filePicker, options, key) => {
//   filePicker.forEach((filePickerRule, i) => {
//     multiDispatch(store, options, filePickerRule, key)
//   });
// };
//
// const multiDispatch = (store, options, filePicker, key) => {
//   if (typeof filePicker === 'string') {
//     stringDispatch(store, filePicker, options, key)
//   } else if (Array.isArray(filePicker)) {
//     listDispatch(store, filePicker, options, key)
//   } else {
//     objectDispatch(store, filePicker, options, key)
//   }
// };
//
// module.exports = (store, options, inputRule, watcher) =>
//   multiDispatch(store, options, inputRule.filePicker, inputRule.key, watcher)

module.exports = (store, options, key, inputRule) => {

    const inFolder = options.inFolder
    const filePath = inputRule.filePicker.filePath || ''
    const fileGlob = inputRule.filePicker.fileGlob

    const initalFileConsumptionPath = `./${inFolder}/${filePath}/${fileGlob}`;
    console.log('initalFileConsumptionPath', initalFileConsumptionPath)
    glob.sync(initalFileConsumptionPath)
    .map((file) => dispatch(store, key, file));

    // watch.createMonitor( `./${inFolder}/${filePath}/` , function(monitor) {
    //   monitor.files[inputRule.fileGlob]
    //   monitor.on('changed', function(f, curr, prev) {
    //     console.log(`${key} - file changed: `, f)
    //     dispatch(store, key, './' + f);
    //   });
    // });

};
