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
}
