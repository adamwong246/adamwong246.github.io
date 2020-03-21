_ = require("lodash");
glob = require("glob");

module.exports = (store, options, config) => {
  _.chain(glob.sync(`./${options.inFolder}/${config.path}/${config.glob}`)).map(function(file) {
    store.dispatch({
      type: config.key,
      payload: file
    });
  })
}
