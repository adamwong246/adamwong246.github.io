const { INITIALIZE } = require('./constants.js');
const stateInitializer = require('./stateInitializer.js');
const fileInitializer = require('./fileInitializer.js');
const makeStore = require('./makeStore.js');

module.exports = (webcrackConfig) => {

  const { store, baseSelector } = makeStore(webcrackConfig);

  Object.keys(webcrackConfig.inputs).forEach((inputRuleKey) => {
    fileInitializer(
      store,
      webcrackConfig.options,
      inputRuleKey,
      webcrackConfig.inputs[inputRuleKey]
    )
  })

  stateInitializer(store, webcrackConfig, baseSelector)


  // lastly, turn the store `on`.
  // This is to prevent unecessary recomputations when initialy adding files to redux
//   store.dispatch({
//     type: INITIALIZE,
//     payload: true
//   })
}
