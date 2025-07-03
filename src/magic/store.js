// no use
/**
 * Created on 2018/1/17.
 */

import { createStore, applyMiddleware, compose, combineReducers } from "redux"
import thunk from "redux-thunk"

export default function initStore(reducer, initialState) {
  let finalCreateStore
  if (process.env.NODE_ENV === "production") {
    finalCreateStore = compose(applyMiddleware(thunk))(createStore)
  } else {
    finalCreateStore = compose(
      applyMiddleware(thunk), //初始化中间件
      window.devToolsExtension ? window.devToolsExtension() : (f) => f
    )(createStore)
  }
  return finalCreateStore(combineReducers(reducer), initialState)
}
