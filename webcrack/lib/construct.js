const stateInitializer = require('./stateInitializer.js');
const fileInitializer = require('./fileInitializer.js');
const makeStore = require('./makeStore.js');

module.exports = (webcrackConfig, callback) => {

  const { store, outputs } = makeStore(webcrackConfig);

  webcrackConfig.inputs.forEach((inputRule) => {
    if (callback) {
      callback(store, inputRule, webcrackConfig.options)
    }
    fileInitializer(store, webcrackConfig.options, inputRule)
  })

  stateInitializer(store, outputs, webcrackConfig.options)
}
