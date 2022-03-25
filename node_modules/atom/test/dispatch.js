'use strict'

var atom = require('../')
var test = require('tape')

var Prom // 0.10 support
try {
  Prom = Promise
} catch (err) {
  Prom = require('es6-promise').Promise
}

var initialState = 0
var genericAction = { a: 1 }
var returnTrue = function () { return true }
var returnUndef = function () { return undefined }
var returnProm = function () { return Prom.resolve() }
var returnFunc = function () { return function () {} }

test('dispatch should change the state', function (t) {
  t.plan(1)
  var store = atom(returnTrue, initialState)
  store.dispatch(genericAction)
  t.notEqual(initialState, store.getState())
})

test('dispatch should throw on undefined', function (t) {
  t.plan(1)

  var msg
  var store = atom(returnUndef, initialState)

  try {
    store.dispatch(genericAction)
  } catch (e) {
    msg = e.message
  }

  t.equal('Reducer must return a value.', msg)
})

test('dispatch should throw on Promise', function (t) {
  t.plan(1)

  var msg
  var store = atom(returnProm, initialState)

  try {
    store.dispatch(genericAction)
  } catch (e) {
    msg = e.message
  }

  t.equal('Reducer cannot return a Promise.', msg)
})

test('dispatch should accept a returned function', function (t) {
  t.plan(2)

  var store = atom(returnFunc, initialState)
  var thrown = false

  try {
    store.dispatch(genericAction)
  } catch (e) {
    thrown = true
  }

  t.equal(false, thrown)
  t.equal(initialState, store.getState())
})

test('dispatch should call reducer with (action, state)', function (t) {
  t.plan(2)
  var store = atom(function (action, state) {
    t.equal(action, genericAction)
    t.equal(state, initialState)
    return state
  }, initialState)
  store.dispatch(genericAction)
})
