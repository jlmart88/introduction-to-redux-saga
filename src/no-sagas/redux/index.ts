import { combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import bakery from 'src/redux/bakery';
import app from 'src/redux/app';

const rootReducer = combineReducers({
  app,
  bakery,
});

const store = createStore(rootReducer, composeWithDevTools());

export default store;
