const { INITIALIZE } = require('./constants.js');

// connects the store subscription to the writeSelectors
// it calls these selectors on every change
// lastly, turn the store on to prevent unecessary file processing on startup

module.exports = (store) => {
  store.subscribe(() => {
    console.log("STATE CHANGED!")
    const writeSelectors = store.getState().writeSelectors
    const keys = Object.keys(writeSelectors)
    console.log('writeSelectors: ', keys)
    keys.forEach((writeKey) => {
      writeSelectors[writeKey](store)
    })
  })

  store.dispatch({
    type: INITIALIZE,
    payload: true
  })
}
