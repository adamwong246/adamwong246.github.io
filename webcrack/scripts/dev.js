const createSelector = require('reselect').createSelector;
const createStore = require('redux').createStore;
const moment = require('moment');
const watch = require('watch');

const {options} = require('../lib/utils.js');
const stateInitializer = require('../lib/stateInitializer.js');
const fileInitializer = require('../lib/fileInitializer.js');
const makeStore = require('../lib/store.js');

const webcrackConfig = require('../../webcrack.config.js')

const {
  store
} = makeStore(webcrackConfig);

webcrackConfig.rules.forEach((config) => {
      if (Object.keys(config).includes('simpleFile')) {
        store.dispatch({
          type: config.key,
          payload: config.simpleFile
        })
      } else {
        watch.createMonitor(`./${options.inFolder}/${config.path}/`, function(monitor) {
          monitor.files[config.glob];
          monitor.on('created', function(f, stat) {
            console.log(`${config.key} created: ` + f)
            store.dispatch({
              type: config.key,
              payload: "./" + f
            });
          });

          monitor.on('changed', function(f, curr, prev) {
            console.log(`${config.key} CHANGED: ` + f)
            store.dispatch({
              type: config.key,
              payload: "./" + f
            });
          });

          // monitor.on('removed', function(f, stat) {
          //   console.log('page removed: ' + f)
          //   store.dispatch({
          //     type: 'REMOVED',
          //     payload: f
          //   })
        });

        fileInitializer(store, options, config)

      }
    })

    stateInitializer(store)
