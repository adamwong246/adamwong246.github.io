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
    console.log("ACTION:" + JSON.stringify(action, null, 2));

    if (!action.type.includes('@@redux')) {

      if (action.type === INITIALIZE) {
        return {
          ...state,
          initialLoad: false
        }
      } else {
        return {
          ...state,
          [action.type]: configs.inputs[action.type].mutater(state, action.payload)
        }
      }
    }
  })

  const stateSelector = (createSelector(store.getState, (state) => {
    return state
  }))

  const initializedSelector = (createSelector(stateSelector, (state) => {
    if (!state.initialLoad){
      return null
    } else {
      return state
    }
  }))

  // const baseSelector = (createSelector(store.getState, (state) => {
  //   return state
  // }))

  return {
    store,
    baseSelector: initializedSelector
  }
}
