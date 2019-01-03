import { applyMiddleware, combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { all } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import bakery, { BakeryState } from 'src/redux/bakery';
import app, { AppState } from 'src/redux/app';
import { incrementCookieCountOnClick } from 'src/redux/sagas/task-1';
import { refreshBakeryStore } from 'src/redux/sagas/task-2';
import { buyAndSellBakeries } from 'src/redux/sagas/task-3-4-5';

export interface RootState {
  app: AppState
  bakery: BakeryState
}

function* rootSaga() {
  yield all([
    incrementCookieCountOnClick(),
    refreshBakeryStore(),
    buyAndSellBakeries(),
  ]);
}

const rootReducer = combineReducers({
  app,
  bakery,
});

const sagaMiddleware = createSagaMiddleware();

const middlewares = [
  sagaMiddleware
];

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(...middlewares)));

sagaMiddleware.run(rootSaga);

export default store;
