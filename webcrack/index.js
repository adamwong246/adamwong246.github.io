// webcrack/index.js

const chokidar = require('chokidar');
const createSelector = require('reselect').createSelector;
const createStore = require('redux').createStore;
const fse = require("fs-extra")
const glob = require("glob-promise");
const path = require("path")
const Promise = require("bluebird")

Promise.config({cancellation: true});

const webcrackConfig = require(process.argv[2])
const mode = process.argv[3]

const INITIALIZE = 'INITIALIZE';
const UPSERT = 'UPSERT';
const REMOVE = 'REMOVE';

const previousState = {}
let outputPromise = Promise.resolve();

function cleanEmptyFoldersRecursively(folder) {
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
    console.log("\u001b[31m\u001b[7m XXX! \u001b[0m" + folder)
    fs.rmdirSync(folder);
    return;
  }
}

const dispatchUpsert = (store, key, file, encodings) => {
  console.log("\u001b[31m <-- \u001b[0m" + file)

  store.dispatch({
    type: UPSERT,
    payload: {
      key: key,
      src: file,
      contents: fse.readFileSync(file, Object.keys(encodings).find((e) => encodings[e].includes(file.split('.')[2])))
    }
  });

  // const filetype = file.split('.')[2]
  // const encoding = Object.keys(encodings).find((e) => encodings[e].includes(filetype))
  // const relativeFilePath = './' + file;
  // console.log("\u001b[31m <-- \u001b[0m" + file)
  // fse.readFile(file, encoding).then((contents) => {
  //   store.dispatch({
  //     type: UPSERT,
  //     payload: {
  //       key: key,
  //       src: file,
  //       contents: contents
  //     }
  //   });
  // });


};

function omit(key, obj) {
  const {
    [key]: omitted, ...rest
  } = obj;
  return rest;
}

const store = createStore((state = {
  initialLoad: true,
  ...webcrackConfig.initialState,
  timestamp: Date.now()
}, action) => {
  // console.log("\u001b[7m\u001b[35m ||| Redux recieved action \u001b[0m", action.type)
  if (!action.type.includes('@@redux')) {

    if (action.type === INITIALIZE) {
      return {
        ...state,
        initialLoad: false,
        timestamp: Date.now()
      }
    } else if (action.type === UPSERT) {
      return {
        ...state,
        [action.payload.key]: {
          ...state[action.payload.key],
          ...{
            [action.payload.src]: action.payload.contents
          }
        },
        timestamp: Date.now()
      }
    } else if (action.type === REMOVE) {
      return {
        ...state,
        [action.payload.key]: omit(action.payload.file, state[action.payload.key]),
        timestamp: Date.now()
      }
    } else {
      console.log("WHAT?!")
      return state
    }
    return state
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


    if ( mode === "build"){
      glob(path, {}).then((files) => {
        files.forEach((file) => {
          dispatchUpsert(store, inputRuleKey, file, webcrackConfig.encodings);
        })
      }).then(() => {
          fulfill()
      })
    } else if (mode === "watch") {

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
          store.dispatch({
            type: REMOVE,
            payload: {
              key: inputRuleKey,
              file: './' + path
            }
          });
        })

    } else {
      console.error(`The 3rd argument should be 'watch' or 'build', not "${mode}"`)
      process.exit(-1)
    }


  });
})).then(function() {

  // listen for changes to the store
  store.subscribe(() => {

    console.log("\u001b[7m\u001b[31m >>> Redux state change... \u001b[0m")

    const outputs = finalSelector(store.getState())

    if (outputPromise.isPending()) {
      console.log('cancelling previous write!')
      outputPromise.cancel()
    }

    outputPromise = Promise.all(
      Array.from(new Set(Object.keys(previousState).concat(Object.keys(outputs))))
      .map((key) => {

        return new Promise((fulfill, reject) => {
          if (!outputs[key]) {

            const file = webcrackConfig.options.outFolder + "/" + key
            console.log("\u001b[31m\u001b[7m XXX? \u001b[0m./" + file)
            try {
              fse.unlinkSync('./' + file)
              cleanEmptyFoldersRecursively('./' + file.substring(0, file.lastIndexOf("/")))
            } catch (ex) {
              // console.error('inner', ex.message);
              // throw ex;
            } finally {
              // console.log('finally');
              return;
            }
            delete previousState[key]
            fulfill()
          } else {
            if (outputs[key] !== previousState[key]) {
              previousState[key] = outputs[key]

              const relativeFilePath = './' + webcrackConfig.options.outFolder + "/" + key;
              const contents = outputs[key];

              if (typeof contents === "function") {
                console.log("\u001b[33m ... \u001b[0m" + relativeFilePath)
                contents((err, res) => {
                  fse.outputFile(relativeFilePath, res, fulfill);
                  console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
                })

              } else if (typeof contents === 'string') {
                fse.outputFile(relativeFilePath, contents, fulfill);
                console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)

              } else if (Buffer.isBuffer(contents)){
                fse.outputFile(relativeFilePath, contents, fulfill);

              } else if (typeof contents.then === 'function'){
                console.log("\u001b[33m ... \u001b[0m" + relativeFilePath)
                Promise.resolve(contents).then(function(value) {

                  if (value instanceof Error){
                    console.log("\u001b[31m !!! \u001b[0m" + relativeFilePath + " " + value.message)
                  } else {
                    fse.outputFile(relativeFilePath, value, fulfill);
                    console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
                  }

                }, function(value) {
                  // not called
                });

              } else {
                console.log("I don't recognize: " + relativeFilePath, contents)
                fse.outputFile(relativeFilePath, contents, callback);
                console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
              }
            } else {
              fulfill()
            }
          }
        });

      })
    ).then(() => {
      cleanEmptyFoldersRecursively(webcrackConfig.options.outFolder);
      console.log("\u001b[7m   All files written. Waiting for changes...   \u001b[0m ")
    })
  })

  // lastly, turn the store `on`.
  // This is to prevent unecessary recomputations when initialy adding files to redux
  store.dispatch({
    type: INITIALIZE,
    payload: true
  });

})
