const {writefile} = require('./utils.js');

// connects the store's `subscribe` to each of the output selectors
module.exports = (store, webcrackConfig, baseSelector) => {
  const outputs = webcrackConfig.outputs(baseSelector)


  // listen for changes to the store
  store.subscribe(() => {

    // interate over every output selector

    // console.log(outputs)
    Object.keys(outputs).forEach((outputKey) => {

      // execute the selector given the store
      outputs[outputKey](store.getState()).forEach((item, i) => {

        key = Object.keys(item)[0]
        filepath = key
        contents = item[key]

        // write the contents to the FS
        writefile(webcrackConfig.options.outFolder + "/" + filepath, contents)
      });

    });
  })

}
