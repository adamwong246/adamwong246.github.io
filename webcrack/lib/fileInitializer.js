_ = require("lodash");
glob = require("glob");
dispatch = require("./dispatch.js")

const objectDispatch = (store, filePicker, options, key) => {
  _.chain(glob.sync(`./${options.inFolder}/${filePicker.filepath}/${filePicker.fileglob}`))
  .map(function(file2) {
    dispatch(store, key, file2);
  })
};

const listDispatch = (store, filePicker, options, key) => {
  filePicker.forEach((filePickerRule, i) => {
    multiDispatch(store, options, filePickerRule, key)
  });
};

const multiDispatch = (store, options, filePicker, key) => {
  if (typeof filePicker === 'string') {
    dispatch(store, key, `./${options.inFolder}/${filePicker}`);
  } else if (Array.isArray(filePicker)) {
    listDispatch(store, filePicker, options, key)
  } else {
    objectDispatch(store, filePicker, options, key)
  }
};

module.exports = (store, options, inputRule) => multiDispatch(store, options, inputRule.filePicker, inputRule.key)
