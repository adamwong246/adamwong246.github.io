const {
  readfile
} = require("./utils.js");

module.exports = (store, key, file) => {
  store.dispatch({
    type: key,
    payload: {
      src: file,
      contents: readfile(file)
    }
  });
}
