# atom

[![Build Status](https://travis-ci.org/staydecent/atom.svg?branch=master)](https://travis-ci.org/staydecent/atom) [![Known Vulnerabilities](https://snyk.io/test/github/staydecent/atom/badge.svg)](https://snyk.io/test/github/staydecent/atom) ![npm](https://img.shields.io/npm/dm/atom.svg)

Shared, synchronous, independent state for JavaScript apps.

Basically re-implemented the [Redux](http://gaearon.github.io/redux/) API without ES6 syntax and some of the top-level API exports. `atom` also has no dependencies and is `~3 KB` unminified and uncompressed!

## Concepts

1. You're application state is hidden within the `atom` function. It cannot be
   mutated outside of the atom function.
2. To affect your state, you need to `dispatch` an "action".
3. An "action" can be just a string, or an object or any value you want. Though, a [Flux Standard Action](https://github.com/acdlite/flux-standard-action) is recommended.
4. You define one or more "reducer" functions that accept the current state and action and return a new state.
5. You can `subscribe` any # of "listeners" that are called after your reducers return a new state.

## Example

```javascript
function counter (action, state) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    case 'INCREMENT_ASYNC':
      return function (dispatch) {
        setTimeout(function () {
          dispatch({type: 'INCREMENT'})
        }, 1000)
      }
    default:
      return state
  }
}

var store = atom(counter, 0)

store.subscribe(function () {
  console.log(store.getState())
})

store.dispatch({ type: 'INCREMENT' }) // 1
store.dispatch({ type: 'INCREMENT' }) // 2
store.dispatch({ type: 'DECREMENT' }) // 1
store.dispatch({ type: 'INCREMENT_ASYNC' }) // 2
```

### With React (or Preact, or similar)

```javascript
class Main extends Component {
  constructor () {
    super()
    // Copy your entire atom state to this Main component.
    this.state = store.getState()
  }

  componentDidMount () {
    // Sync your atom state with this component's state
    store.subscribe(() => this.setState(store.getState()))
  }

  render (_, state) {
    // Pass the state object down to your child components as props
    return (
      <Child {...state}></Child>
    )
  }
}
```

That's it! And within your child components you can call `store.dispatch` to update the atom state and have it sync to the `Main` component which will then pass the updated state object down to all of your child components!

### See also
[Simple Routing Example](https://github.com/staydecent/atom-routing-example)

[WithState Component](https://github.com/inputlogic/elements/blob/master/components/with-state/index.js)

[HoC that builds Actions and Reducers on the fly](https://github.com/inputlogic/elements/blob/master/components/connect/index.js#L39)

## API

### atom(reducers[, initialState])

Creates your atom "store" that contains your application state. Returns an Object with methods for interacting with your state. You can pass an array of reducers as well. Each one will be called with the actions, and the returned state will be given to the next reducer in the array. That means the order of your reducers may be of importance!

#### reducer(action, state)

A function that accepts `function(action, state)` and returns the potentially modified `state`. You can also return a function with the signature `function(dispatch)` for performing asynchronous tasks before modifying the state. When your async task completes, the passed in `dispatch` function can be called with an "action" that results your reducer returning a new state. The parameter order is the opposite of Redux to accommodate currying.

### Store API

#### dispatch(action[, action1, action2, ...])

This calls your "reducers" with the given "action" and the current state. Optionally, you can pass in as many actions as you want as aguments and they will be handled in the order given. Your "subscribed" listeners will not be called until all actions have been processed.

#### subscribe(listener)

Add a function to be called anytime after your "reducer" has returned a new state. This is useful for logging changes or syncing to your storage or database.

You can add as many listeners as you would like. Returns a function that when called will unsubscribe the listener.

#### unsubcribe(listener)

Remove the given listener so it's no longer called after state changes.

#### getState()

Returns the current state. Useful for calling within a `subscribe`d listener.

#### setState(state)

Calls a simple internal reducer that will merge the passed in state with the existing state.

#### addReducer(reducer)

Add another reducer to your store, that will be called when an action is dispatched.


## Debugging with Redux Devtools

Make sure to have [Redux devtools extension](https://github.com/zalmoxisus/redux-devtools-extension) installed.

```js
import atom from 'atom'
import devtools from 'atom/devtools'

const store = process.env.NODE_ENV === 'production' 
  ? atom(reducers, initialState)
  : devtools(atom(reducers, initialState))

// ...
```
