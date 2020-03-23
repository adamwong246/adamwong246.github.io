const glob = require("glob");
const dispatch = require("./dispatch.js")
const chokidar = require('chokidar');

module.exports = (store, options, key, inputRule) => {

  const inFolder = options.inFolder
  const filePath = inputRule.filePath || ''

  const path = `./${inFolder}/${filePath}`

  chokidar.watch(path, {})
    .on('add', path => {
      console.log(`File ${path} has been added`)
      dispatch(store, key, './' + path);
    })
    .on('change', path => {
      console.log(`File ${path} has been changed`)
        dispatch(store, key, './' + path);
    })
    // .on('unlink', path => log(`File ${path} has been removed`));
    // .on('addDir', path => log(`Directory ${path} has been added`))
    // .on('unlinkDir', path => log(`Directory ${path} has been removed`))
    // .on('error', error => log(`Watcher error: ${error}`))
    // .on('ready', () => log('Initial scan complete. Ready for changes'))
    // .on('raw', (event, path, details) => { // internal
    //   log('Raw event info:', event, path, details);
    // });
};
