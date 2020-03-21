const createSelector = require('reselect').createSelector;
const createStore = require('redux').createStore;
const moment = require('moment');

const {options} = require('../lib/utils.js');
const stateInitializer = require('../lib/stateInitializer.js');
const fileInitializer = require('../lib/fileInitializer.js');
const makeStore = require('../lib/store.js');

const webcrackConfig = require('../../webcrack.config.js')

const {store} = makeStore(webcrackConfig);

webcrackConfig.rules.forEach((config) => {
  if (Object.keys(config).includes('simpleFile')) {
    store.dispatch({
      type: config.key,
      payload: config.simpleFile
    })
  } else {
    fileInitializer(store, options, config)
  }
})

stateInitializer(store)
