const { INITIALIZE } = require('./constants.js');
const {writefile} = require('./utils.js');

// connects the store's `subscribe` to each of the output selectors
module.exports = (store, outputs, webcrackConfigOptions) => {

  // listen for changes to the store
  store.subscribe(() => {

    // interate over every output selector

    // console.log(outputs)
    outputs.forEach((output) => {

      // execute the selector given the store
      output.selector(store).forEach((item, i) => {

        // write the contents to the FS
        writefile(webcrackConfigOptions.outFolder + "/" + item.filepath, item.contents)
      });

    })
  })

  // lastly, turn the store `on`.
  // This is to prevent unecessary recomputations when initialy adding files to redux
  store.dispatch({
    type: INITIALIZE,
    payload: true
  })
}
