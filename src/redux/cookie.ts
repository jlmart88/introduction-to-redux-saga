import actionCreatorFactory from 'typescript-fsa';

const cookieActionCreatorFactory = actionCreatorFactory('cookie');

export const actionCreators = {
  clickCookie: cookieActionCreatorFactory<void>('CLICK_COOKIE'),
};
