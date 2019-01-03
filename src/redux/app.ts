import actionCreatorFactory, { AnyAction, isType } from 'typescript-fsa';
import { Reducer } from 'redux';

export interface AppState {
  cookieCount: number;
}

export const initialState: AppState = {
  cookieCount: 0,
};

const appActionCreatorFactory = actionCreatorFactory('app');

export const actionCreators = {
  incrementCookieCount: appActionCreatorFactory<number>('INCREMENT_COOKIE_COUNT'),
  decrementCookieCount: appActionCreatorFactory<number>('DECREMENT_COOKIE_COUNT'),
};

export const canDecrementCookieCount = (cookieCount: AppState['cookieCount'], amount: number) => {
  return cookieCount >= amount;
};

const reducer: Reducer = (state: AppState = initialState, action: AnyAction): AppState => {
  if (isType(action, actionCreators.incrementCookieCount)) {
    return {
      ...state,
      cookieCount: state.cookieCount + action.payload
    };
  }
  if (isType(action, actionCreators.decrementCookieCount)) {
    return {
      ...state,
      cookieCount: state.cookieCount - action.payload
    };
  }

  return state;
};

export default reducer;
