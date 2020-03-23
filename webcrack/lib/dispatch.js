const {
  readfile
} = require("./utils.js");

module.exports = (store, key, file) => {
  console.log('dispatching ' + key, file)
  store.dispatch({
    type: key,
    payload: {
      src: file,
      contents: readfile(file)
    }
  });
}
