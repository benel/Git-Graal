/* globals define */
(function (root, factory) {
  'use strict'
  if (typeof define === 'function' && define.amd) {
    define([], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory()
  } else {
    root.atom = factory()
  }
}(this, function () {
  'use strict'

  return function (reducers, initialState) {
    if (typeof reducers === 'function') {
      reducers = [reducers]
    }
    var listeners = []
    var state = initialState

    reducers.push(function setStateReducer (action, state) {
      return action && action.type === '__ATOM_SET_STATE__'
        ? Object.assign(state, action.payload)
        : state
    })

    return {
      addReducer: addReducer,
      removeReducer: removeReducer,
      dispatch: dispatch,
      subscribe: subscribe,
      unsubscribe: unsubscribe,
      getState: getState,
      setState: setState
    }

    function addReducer (reducer) {
      if (typeof reducer !== 'function') {
        throw new E('reducer must be a function')
      }
      reducers.push(reducer)
    }

    function removeReducer (reducer) {
      if (!reducer) return
      const idx = reducers.findIndex(l => l === reducer)
      idx > -1 && reducers.splice(idx, 1)
    }

    function dispatch (/* action[, action1, action2, ...] */) {
      var len = arguments.length
      var newState = getState()
      for (var x = 0; x < len; x++) {
        newState = callReducers(reducers, arguments[x], newState)
      }
      if (validState(newState)) {
        cb(newState)
      }
    }

    function subscribe (listener) {
      if (typeof listener !== 'function') {
        throw new E('listener must be a function')
      }
      listeners.push(listener)
      return function () { unsubscribe(listener) }
    }

    function unsubscribe (listener) {
      if (!listener) return
      const idx = listeners.findIndex(l => l === listener)
      idx > -1 && listeners.splice(idx, 1)
    }

    function getState () {
      return typeof state === 'object'
        ? Object.assign({}, state)
        : state
    }

    function setState (newState, meta) {
      dispatch({ type: '__ATOM_SET_STATE__', payload: newState, meta: meta })
    }

    // Private

    function callReducers (fns, action, state) {
      var newState = state
      var len = reducers.length
      var ret
      for (var x = 0; x < len; x++) {
        ret = fns[x](action, newState)
        if (validState(ret)) {
          newState = ret
        }
      }
      return newState
    }

    function cb (newState) {
      state = newState
      for (var x = 0; x < listeners.length; x++) {
        listeners[x]()
      }
    }

    function validState (newState) {
      if (newState === undefined) {
        throw new E('Reducer must return a value.')
      } else if (typeof newState.then === 'function') {
        throw new E('Reducer cannot return a Promise.')
      } else if (typeof newState === 'function') {
        newState(dispatch)
      } else {
        return true
      }
    }

    function E (message) {
      this.message = message
      this.name = 'AtomException'
      this.toString = function () {
        return this.name + ': ' + this.message
      }
    }
  }
}))
