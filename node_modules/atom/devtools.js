module.exports = function atomDevTools (store) {
  var extension = window.__REDUX_DEVTOOLS_EXTENSION__ || (window.top && window.top.__REDUX_DEVTOOLS_EXTENSION__)
  var ignoreState = false

  if (!extension) {
    console.warn('Please install/enable Redux devtools extension')
    store.devtools = null
    return store
  }

  if (!store.devtools) {
    store.devtools = extension.connect()

    store.devtools.subscribe(function (message) {
      if (message.type === 'DISPATCH' && message.state) {
        ignoreState = (message.payload.type === 'JUMP_TO_ACTION' || message.payload.type === 'JUMP_TO_STATE')
        store.setState(JSON.parse(message.state))
      }
    })

    store.devtools.init(store.getState())

    store.addReducer(function devtoolsReducer (action, state) {
      if (!ignoreState) {
        if (action.type === '__ATOM_SET_STATE__') {
          store.devtools.send({
            type: action.type + ' ' + Object.keys(action.payload),
            payload: action.payload
          }, state)
        } else {
          store.devtools.send(action, state)
        }
      } else {
        ignoreState = false
      }
      return state
    })
  }

  return store
}
