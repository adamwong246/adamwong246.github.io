const glob = require("glob");
const dispatch = require("./dispatch.js")
const watch = require('watch');

module.exports = (store, options, key, inputRule) => {

    const inFolder = options.inFolder
    const filePath = inputRule.filePath || ''
    const fileGlob = inputRule.fileGlob

    glob.sync(`./${inFolder}/${filePath}/${fileGlob}`)
    .map((file) => dispatch(store, key, file));

    // watch.createMonitor( `./${inFolder}/${filePath}/` , function(monitor) {
    //   monitor.files[inputRule.fileGlob]
    //
    //   console.log(monitor.files[inputRule.fileGlob])
    //   // monitor.on('changed', function(f, curr, prev) {
    //   //   console.log(`${key} - file changed: `, f)
    //   //   dispatch(store, key, './' + f);
    //   // });
    // });

};
