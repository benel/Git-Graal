'use strict'

var atom = require('../')
var test = require('tape')

var genericAction = { a: 1 }

test('atom should accept a single reducer', function (t) {
  t.plan(1)

  var called = false
  var singleReducer = function () {
    called = true
    return called
  }
  var store = atom(singleReducer, 0)

  store.dispatch(genericAction)

  t.ok(called)
})

test('atom should accept an array of reducers', function (t) {
  t.plan(1)

  var store = atom([
    function (_, state) { return state + 2 },
    function (_, state) { return state * state },
    function (_, state) { return '' + state }
  ], 0)

  store.dispatch(genericAction)

  t.equal(store.getState(), '4')
})

test('atom should handle an async reducer', function (t) {
  t.plan(1)

  var calls = 0
  var store = atom([
    function (_, state) { return state + 1 },
    function (_, state) {
      return function (dispatch) {
        if (calls) return
        setTimeout(function () {
          dispatch(genericAction)
        }, 1000)
      }
    },
    function (_, state) { return state + 1 }
  ], 0)

  store.subscribe(function () {
    calls++
    if (calls === 2) {
      t.equal(store.getState(), 4)
    }
  })

  store.dispatch(genericAction)
})
