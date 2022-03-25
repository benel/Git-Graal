'use strict'

var atom = require('../')
var test = require('tape')

var addAction = function (n) {
  return { type: 'ADD', payload: n }
}

var multiplyAction = function (n) {
  return { type: 'MULTIPLY', payload: n }
}

var addReducer = function (action, state) {
  switch (action.type) {
    case 'ADD':
      return state + action.payload
    case 'MULTIPLY':
      return state * action.payload
  }
  return state
}

test('should be able to batch actions', function (t) {
  t.plan(1)

  var store = atom(addReducer, 0)

  store.subscribe(function () {
    t.equal(store.getState(), 6)
  })

  store.dispatch(addAction(1), multiplyAction(3), multiplyAction(2))
})
