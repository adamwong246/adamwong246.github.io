const chokidar = require('chokidar');
const createSelector = require('reselect').createSelector;
const createStore = require('redux').createStore;
const Promise = require("bluebird")
const fse = require("fs-extra")
const glob = require("glob");

const webcrackConfig = require("../webcrack.config.js")

const INITIALIZE = 'INITIALIZE';

const dispatch = (store, key, file) => {
  store.dispatch({
    type: key,
    payload: {
      src: file,
      contents: readfile(file)
    }
  });
};

const readfile = (file) => {
  const relativeFilePath = './' + file;
  console.log("\u001b[31m <-- \u001b[0m" + file)
  return fse.readFileSync(file, 'utf8');
};

const writefile = (file, contents) => {
  const relativeFilePath = './' + file;

  if (typeof contents === "function") {
    console.log("\u001b[33m ... \u001b[0m" + relativeFilePath)
    contents((err, res) => {
      fse.outputFile(relativeFilePath, res);
      console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
    })
  } else {
    fse.outputFile(relativeFilePath, contents);
    console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
  }
}

const store = createStore((state = {
  initialLoad: true,
  ...webcrackConfig.initialState
}, action) => {
  // console.log("ACTION:" + JSON.stringify(action, null, 2));

  if (!action.type.includes('@@redux')) {

    if (action.type === INITIALIZE) {
      return {
        ...state,
        initialLoad: false
      }
    } else {

      const key = Object.keys(webcrackConfig.inputs[action.type])[0]
      const mutater = webcrackConfig.inputs[action.type][key]
      return {
        ...state,
        [action.type]: mutater(state[action.type], action.payload)
      }
    }
  }
})

const outputs = webcrackConfig.outputs((store) => store)

const fsWatchers = Object.keys(webcrackConfig.inputs).map((inputRuleKey) => {
  const path = `./${webcrackConfig.options.inFolder}/${Object.keys(webcrackConfig.inputs[inputRuleKey])[0] || ''}`

  return new Promise((fulfill, reject) => {
    chokidar.watch(path, {})
      .on('ready', () => {
        // console.log(`${inputRuleKey} is ready`)
        fulfill()
      })
      .on('add', path => {
        // console.log(`File ${path} has been added`)
        dispatch(store, inputRuleKey, './' + path);
      })
      .on('change', path => {
        // console.log(`File ${path} has been changed`)
        dispatch(store, inputRuleKey, './' + path);
      })
    // .on('unlink', path => log(`File ${path} has been removed`));
    // .on('addDir', path => log(`Directory ${path} has been added`))
    // .on('unlinkDir', path => log(`Directory ${path} has been removed`))
    // .on('error', error => log(`Watcher error: ${error}`))
    // .on('raw', (event, path, details) => { // internal
    //   log('Raw event info:', event, path, details);
    // });
  });
})

// Wait for all the file watchers to check in
Promise.all(fsWatchers).then(function() {

  // listen for changes to the store
  store.subscribe(() => {

    const state = store.getState();

    // interate over every output selector
    Object.keys(outputs).forEach((outputKey) => {

      // execute the selector given the store
      outputs[outputKey](state).forEach((item, i) => {

        key = Object.keys(item)[0]
        // write the contents to the FS
        writefile(webcrackConfig.options.outFolder + "/" + key, item[key])
      });
    });
  })

  // lastly, turn the store `on`.
  // This is to prevent unecessary recomputations when initialy adding files to redux
  store.dispatch({
    type: INITIALIZE,
    payload: true
  });

});
