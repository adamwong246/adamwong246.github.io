const chokidar = require('chokidar');
const createSelector = require('reselect').createSelector;
const createStore = require('redux').createStore;
const Promise = require("bluebird")
const fse = require("fs-extra")
const glob = require("glob");

const webcrackConfig = require("../webcrack.config.js")

const INITIALIZE = 'INITIALIZE';
const previousState = {}

const watchMode = false
if (process.argv[2] == 'watch') {
  watchMode = true
}


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
      const key = Object.keys(webcrackConfig.inputs[action.type])[0]
      const reduce = webcrackConfig.inputs[action.type][key]
      return {
        ...state,
        [action.type]: reduce(state[action.type], action.payload)
      }
    }
  }
})

const rootSelector = ((state) => {
  return state;
});

const outputConfigs = webcrackConfig.outputs(rootSelector)

const outputSelectors = Object.keys(outputConfigs).map((outputKey) => {
  return outputConfigs[outputKey]
});

const finalSelector = createSelector(outputSelectors, (...outputs) => {
  return outputs.reduce((memo, output) => {
    return {
      ...memo, ...output
    }

  }, {})
})

// Wait for all the file watchers to check in
Promise.all(Object.keys(webcrackConfig.inputs).map((inputRuleKey) => {
  const path = `./${webcrackConfig.options.inFolder}/${Object.keys(webcrackConfig.inputs[inputRuleKey])[0] || ''}`

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

    const finalWriters = finalSelector(store.getState())
    Object.keys(finalWriters).forEach((key) => {
      if (finalWriters[key] !== previousState[key]){
        writefile(webcrackConfig.options.outFolder + "/" + key,   finalWriters[key])
        previousState[key] = finalWriters[key]
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
