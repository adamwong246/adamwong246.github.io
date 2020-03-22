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
    // console.log(JSON.stringify(action, null, 2));

    if (!action.type.includes('@@redux')) {

      if (action.type === INITIALIZE) {
        return {
          ...state,
          initialLoad: false
        }
      } else {
        return {
          ...state,
          [action.type]: [
            ...state[action.type],
            action.payload
          ]
        }
      }
    }
  })

  return {
    store,
    outputs: configs.outputs((store) => createSelector(store.getState, (state) => state)(store), configs.options)
  }
}
