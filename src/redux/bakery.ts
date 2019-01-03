import actionCreatorFactory, { AnyAction, isType } from 'typescript-fsa';
import { Reducer } from 'redux';
import * as _ from 'lodash';

export interface Bakery {
  id: string;
  name: string;
  cookiesPerSec: number;
  cookieCost: number;
}

export interface PurchasedBakery {
  id: number;
  bakeryId: string;
  isBeingSold: boolean;
}

export interface BakeryState {
  bakeries: Bakery[];
  loading: boolean;
  purchasedBakeries: PurchasedBakery[];
}

export const initialState: BakeryState = {
  bakeries: [],
  loading: false,
  purchasedBakeries: [],
};

export const BAKERY_REFUND_RATIO = 0.8;

const bakeryActionCreatorFactory = actionCreatorFactory('bakery');

export const actionCreators = {
  requestBakeries: bakeryActionCreatorFactory.async<void, Bakery[]>('REQUEST_BAKERIES'),
  buyBakery: bakeryActionCreatorFactory<string>('BUY_BAKERY'),
  sellBakery: bakeryActionCreatorFactory.async<PurchasedBakery, void>('SELL_BAKERY'),
};

const getNextPurchasedBakeryId = (purchasedBakeries: PurchasedBakery[]): number => {
  const maxId = purchasedBakeries.reduce<number>((prev, current) => (Math.max(prev, current.id)), -1);
  return maxId + 1;
};

const setIsBeingSold = (
  purchasedBakeries: PurchasedBakery[],
  purchasedBakery: PurchasedBakery,
  isBeingSold: boolean
): PurchasedBakery[] => {
  const isBeingSoldIndex = _.findIndex(purchasedBakeries, ['id', purchasedBakery.id]);
  let newPurchasedBakeries = [...purchasedBakeries.slice(0, isBeingSoldIndex)];
  newPurchasedBakeries.push({
    ...purchasedBakeries[isBeingSoldIndex],
    isBeingSold,
  });
  newPurchasedBakeries = newPurchasedBakeries.concat(...purchasedBakeries.slice(isBeingSoldIndex + 1));
  return newPurchasedBakeries;
};

const reducer: Reducer = (state: BakeryState = initialState, action: AnyAction): BakeryState => {
  if (isType(action, actionCreators.buyBakery)) {
    const newPurchasedBakery: PurchasedBakery = {
      id: getNextPurchasedBakeryId(state.purchasedBakeries),
      bakeryId: action.payload,
      isBeingSold: false,
    };
    return {
      ...state,
      purchasedBakeries: [...state.purchasedBakeries, newPurchasedBakery],
    };
  }
  if (isType(action, actionCreators.sellBakery.started)) {
    const { purchasedBakeries } = state;
    return {
      ...state,
      purchasedBakeries: setIsBeingSold(purchasedBakeries, action.payload, true)
    };
  }
  if (isType(action, actionCreators.sellBakery.done)) {
    const { purchasedBakeries } = state;
    const removedIndex = _.findIndex(purchasedBakeries, ['id', action.payload.params.id]);
    return {
      ...state,
     purchasedBakeries: [...purchasedBakeries.slice(0, removedIndex), ...purchasedBakeries.slice(removedIndex + 1)],
    };
  }
  if (isType(action, actionCreators.sellBakery.failed)) {
    const { purchasedBakeries } = state;
    return {
      ...state,
      purchasedBakeries: setIsBeingSold(purchasedBakeries, action.payload.params, false)
    };
  }
  if (isType(action, actionCreators.requestBakeries.started)) {
    return {
      ...state,
      loading: true,
    };
  }
  if (isType(action, actionCreators.requestBakeries.done)) {
    return {
      ...state,
      loading: false,
      bakeries: action.payload.result,
    };
  }
  if (isType(action, actionCreators.requestBakeries.failed)) {
    return {
      ...state,
      loading: false,
    };
  }

  return state;
};

export default reducer;
