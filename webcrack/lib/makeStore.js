const createStore = require('redux').createStore;
const createSelector = require('reselect').createSelector;

const {
  INITIALIZE,
  ADD_INTERMEDIATE_SELECTORS
} = require('./constants.js');

module.exports = (configs) => {

  const store = createStore((state = {
    initialLoad: true,
    ...configs.initialState
  }, action) => {

    // console.log("ACTION:" + JSON.stringify(action, null, 2));

    if (!action.type.includes('@@redux')) {

      if (action.type === INITIALIZE) {
        return {
          ...state,
          initialLoad: false
        }
      } else {
        const key = action.type
        const mutater = configs.inputs[key].mutater
        mutation = mutater(state, action.payload)

        return {
          ...state,
          [action.type]: mutation
        }
      }
    }
  })

  const baseSelector = createSelector(store.getState, (state) => state)
  // console.log(baseSelector)
  return {
    store,
    baseSelector
  }
}
