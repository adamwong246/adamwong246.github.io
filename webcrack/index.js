const chokidar = require('chokidar');
const createSelector = require('reselect').createSelector;
const createStore = require('redux').createStore;
const Promise = require("bluebird")
const fse = require("fs-extra")
const glob = require("glob");

const webcrackConfig = require("../webcrack.config.js")

const INITIALIZE = 'INITIALIZE';
const UPSERT = 'UPSERT';
const REMOVE = 'REMOVE';

const previousState = {}

const dispatchUpsert = (store, key, file, encodings) => {
  store.dispatch({
    type: UPSERT,
    payload: {
      key: key,
      src: file,
      contents: readfile(file, encodings)
    }
  });
};

const dispatchRemove = (store, key, file) => {
  store.dispatch({
    type: REMOVE,
    payload: {
      key: key,
      file: file
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

const writefile = (file, contents, callback) => {
  const relativeFilePath = './' + file;

  if (typeof contents === "function") {
    console.log("\u001b[33m ... \u001b[0m" + relativeFilePath)
    contents((err, res) => {
      fse.outputFile(relativeFilePath, res, callback);
      console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
    })
  } else if (typeof contents === 'string'){
    fse.outputFile(relativeFilePath, contents, callback);
    console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
  } else {
    // console.log("I don't recognize: " + relativeFilePath)
    fse.outputFile(relativeFilePath, contents, callback);
    console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
  }
}

const removefile = (file, callback) => {
  console.log("\u001b[31m\u001b[7m XXX \u001b[0m" + file)
  fse.unlinkSync('./'+file, callback)
};

function omit(key, obj) {
  const { [key]: omitted, ...rest } = obj;
  return rest;
}

const store = createStore((state = {
  initialLoad: true,
  ...webcrackConfig.initialState
}, action) => {
  console.log(action.type)
  console.log("\u001b[7m\u001b[35m ||| Redux recieved action \u001b[0m", action.type)
  if (!action.type.includes('@@redux')) {

    if (action.type === INITIALIZE) {
      return {
        ...state,
        initialLoad: false
      }
    }

    else if (action.type === UPSERT){
      return {
        ...state,
        [action.payload.key]: {
          ...state[action.payload.key],
          ...{
            [action.payload.src]: action.payload.contents
          }
        }
      }
    } else if (action.type === REMOVE){
      return {
        ...state,
        [action.payload.key]: omit(action.payload.file, state[action.payload.key])
      }
    } else {
      console.log("WHAT?!")
      return state
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
      .on('error', error => {
        console.log("\u001b[7m !!! \u001b[0m" + path)
      })
      .on('ready', () => {
        console.log("\u001b[7m\u001b[36m  >  \u001b[0m" + path)
        fulfill()
      })
      .on('add', path => {
        console.log("\u001b[7m\u001b[34m  +  \u001b[0m" + path)
        dispatchUpsert(store, inputRuleKey, './' + path, webcrackConfig.encodings);
      })
      .on('change', path => {
        console.log("\u001b[7m\u001b[35m  !  \u001b[0m" + path)
        dispatchUpsert(store, inputRuleKey, './' + path, webcrackConfig.encodings);
      })
      .on('unlink', path => {
        console.log("\u001b[7m\u001b[31m  -  \u001b[0m" + path)
        dispatchRemove(store, inputRuleKey, './' + path)
      })
  });
})).then(function() {

  // listen for changes to the store
  store.subscribe(() => {

    console.log("\u001b[7m\u001b[31m >>> Redux state change... \u001b[0m")

    const state = finalSelector(store.getState())

    // console.log(Object.keys(state))
    // console.log(previousState)

    const writePromises = Object.keys(state)
    .map((key) => {
      return new Promise((fulfill, reject) => {

        // if (!previousState[key]){
        //   console.log(key, " was not found")
        //
        //   // previousState[key] = state[key]
        //   if (previousState){
        //     // removefile(webcrackConfig.options.outFolder + "/" + key,  fulfill)
        //     console.log("removing because not inital")
        //   } else {
        //     console.log("not bothering to remove file on initial load")
        //   }
        //
        // }
        if (state[key] !== previousState[key]){
          previousState[key] = state[key]
          writefile(webcrackConfig.options.outFolder + "/" + key,   state[key], fulfill)
        } else {
          fulfill()
        }
      })
    })

    Promise.all(writePromises).then((v) => {
      console.log("\u001b[7m All files written. Waiting for changes...\u001b[0m ")
    })
  })

  // lastly, turn the store `on`.
  // This is to prevent unecessary recomputations when initialy adding files to redux
  store.dispatch({
    type: INITIALIZE,
    payload: true
  });

})
