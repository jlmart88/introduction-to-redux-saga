import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { App } from 'src/no-sagas/app';
import store from 'src/no-sagas/redux';
import 'semantic-ui-css/semantic.css';

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
);
