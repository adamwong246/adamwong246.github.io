const chokidar = require('chokidar');
const createSelector = require('reselect').createSelector;
const createStore = require('redux').createStore;
const Promise = require("bluebird")
const fse = require("fs-extra")
const glob = require("glob");

const webcrackConfig = require("../webcrack.config.js")

const INITIALIZE = 'INITIALIZE';
const previousState = {}

const dispatch = (store, key, file, encodings) => {
  store.dispatch({
    type: key,
    payload: {
      src: file,
      contents: readfile(file, encodings)
    }
  });
};

const readfile = (file, encodings) => {

  const filetype = file.split('.')[2]
  const encoding = Object.keys(encodings).find((e) => encodings[e].includes(filetype))

  const relativeFilePath = './' + file;
  console.log("\u001b[31m <-- \u001b[0m" + file)
  return fse.readFileSync(file, encoding);
};

const writefile = (file, contents) => {
  const relativeFilePath = './' + file;

  if (typeof contents === "function") {
    console.log("\u001b[33m ... \u001b[0m" + relativeFilePath)
    contents((err, res) => {
      fse.outputFile(relativeFilePath, res);
      console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
    })
  } else if (typeof contents === 'string'){
    fse.outputFile(relativeFilePath, contents );
    console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
  } else {
    console.log("I don't recognize: " + relativeFilePath)
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
      return {
        ...state,
        [action.type]: {
          ...state[action.type],
          ...{
            [action.payload.src]: action.payload.contents
          }
        }
      }
    }
  }
})

const finalSelector = webcrackConfig.outputs(Object.keys(webcrackConfig.inputs).reduce((mm, inputKey) => {
    return {
      ...mm,
      [inputKey]: createSelector([(x) => x], (root) => root[inputKey])
    }
}, {}))

// Wait for all the file watchers to check in
Promise.all(Object.keys(webcrackConfig.inputs).map((inputRuleKey) => {
  const path = `./${webcrackConfig.options.inFolder}/${webcrackConfig.inputs[inputRuleKey] || ''}`
  return new Promise((fulfill, reject) => {
    chokidar.watch(path, {})
      .on('ready', () => {
        fulfill()
      })
      .on('add', path => {
        dispatch(store, inputRuleKey, './' + path, webcrackConfig.encodings);
      })
      .on('change', path => {
        dispatch(store, inputRuleKey, './' + path, webcrackConfig.encodings);
      })
    // .on('unlink', path => log(`File ${path} has been removed`));
    // .on('addDir', path => log(`Directory ${path} has been added`))
    // .on('unlinkDir', path => log(`Directory ${path} has been removed`))
    // .on('error', error => log(`Watcher error: ${error}`))
    // .on('raw', (event, path, details) => { // internal
    //   log('Raw event info:', event, path, details);
    // });
  });
})).then(function() {

  // listen for changes to the store
  store.subscribe(() => {

    const newState = finalSelector(store.getState())
    Object.keys(newState).forEach((key) => {
      if (newState[key] !== previousState[key]){
        writefile(webcrackConfig.options.outFolder + "/" + key,   newState[key])
        previousState[key] = newState[key]
      }
    })
  })

  // lastly, turn the store `on`.
  // This is to prevent unecessary recomputations when initialy adding files to redux
  store.dispatch({
    type: INITIALIZE,
    payload: true
  });

})
