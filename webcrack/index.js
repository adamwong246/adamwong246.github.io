const chokidar = require('chokidar');
const createSelector = require('reselect').createSelector;
const createStore = require('redux').createStore;
const Promise = require("bluebird")
const fse = require("fs-extra")
const glob = require("glob");
const path = require("path")
const webcrackConfig = require("../webcrack.config.js")

const INITIALIZE = 'INITIALIZE';
const UPSERT = 'UPSERT';
const REMOVE = 'REMOVE';

const previousState = {}

function cleanEmptyFoldersRecursively(folder) {
  // console.log('cleanEmptyFoldersRecursively', folder);
  var isDir = fs.statSync(folder).isDirectory();
  if (!isDir) {
    return;
  }
  var files = fs.readdirSync(folder);
  if (files.length > 0) {
    files.forEach(function(file) {
      var fullPath = path.join(folder, file);
    });

    // re-evaluate files; after deleting subfolder
    // we may have parent folder empty now
    files = fs.readdirSync(folder);
  }

  if (files.length == 0) {
    console.log("\u001b[31m\u001b[7m XXX \u001b[0m" + folder)
    fs.rmdirSync(folder);
    return;
  }
}


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
  } else if (typeof contents === 'string') {
    fse.outputFile(relativeFilePath, contents, callback);
    console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
  } else {
    // console.log("I don't recognize: " + relativeFilePath)
    fse.outputFile(relativeFilePath, contents, callback);
    console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
  }
}

const removefile = (file) => {
  console.log("\u001b[31m\u001b[7m XXX \u001b[0m./" + file)
  try {
    fse.unlinkSync('./' + file)
    cleanEmptyFoldersRecursively('./' + file.substring(0, file.lastIndexOf("/")))
  } catch (ex) {
    console.error('inner', ex.message);
    throw ex;
  } finally {
    // console.log('finally');
    return;
  }

};

function omit(key, obj) {
  const {
    [key]: omitted, ...rest
  } = obj;
  return rest;
}

const store = createStore((state = {
  initialLoad: true,
  ...webcrackConfig.initialState
}, action) => {
  // console.log("\u001b[7m\u001b[35m ||| Redux recieved action \u001b[0m", action.type)
  if (!action.type.includes('@@redux')) {

    if (action.type === INITIALIZE) {
      return {
        ...state,
        initialLoad: false
      }
    } else if (action.type === UPSERT) {
      return {
        ...state,
        [action.payload.key]: {
          ...state[action.payload.key],
          ...{
            [action.payload.src]: action.payload.contents
          }
        }
      }
    } else if (action.type === REMOVE) {
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
        console.log("\u001b[7m\u001b[34m  +  \u001b[0m./" + path)
        dispatchUpsert(store, inputRuleKey, './' + path, webcrackConfig.encodings);
      })
      .on('change', path => {
        console.log("\u001b[7m\u001b[35m  !  \u001b[0m" + path)
        dispatchUpsert(store, inputRuleKey, './' + path, webcrackConfig.encodings);
      })
      .on('unlink', path => {
        console.log("\u001b[7m\u001b[31m  -  \u001b[0m./" + path)
        dispatchRemove(store, inputRuleKey, './' + path)
      })
  });
})).then(function() {

  // listen for changes to the store
  store.subscribe(() => {

    // console.log("\u001b[7m\u001b[31m >>> Redux state change... \u001b[0m")

    const state = finalSelector(store.getState())
    const writePromises = Array.from(new Set(Object.keys(previousState).concat(Object.keys(state))))
      .map((key) => {
        return new Promise((fulfill, reject) => {
          if (!state[key]) {
            removefile(webcrackConfig.options.outFolder + "/" + key)
            delete previousState[key]
            fulfill()
          } else {
            if (state[key] !== previousState[key]) {
              previousState[key] = state[key]
              writefile(webcrackConfig.options.outFolder + "/" + key, state[key], fulfill)
            } else {
              fulfill()
            }
          }
        })
      })

    Promise.all(writePromises).then((v) => {
      cleanEmptyFoldersRecursively(webcrackConfig.options.outFolder);
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
