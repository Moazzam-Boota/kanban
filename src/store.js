import { createStore, applyMiddleware, combineReducers } from 'redux'
import { excelReducer, pitchTimeReducer } from "./redux/reducer/excelReducer";
import thunk from "redux-thunk";
const initialState = {
  sidebarShow: 'responsive'
}
const middleWare = [thunk];

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

const store = createStore(combineReducers({
  changeState,
  pitchTimeReducer,
  excelReducer,
}), applyMiddleware(...middleWare))
export default store