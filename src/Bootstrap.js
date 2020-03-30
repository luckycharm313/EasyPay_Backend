import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import Root from './Root';
import configureStore from './redux/store/configure-store';

// Require globals
import 'bootstrap/dist/css/bootstrap.css'
import './css/app.css';

import './assets/favicon.ico';

const {store, persistor} = configureStore();

const ROOT_ELEMENT = 'easypay-app';

ReactDOM.render(
  <AppContainer>
    <Root store={store} persistor={persistor}/>
  </AppContainer>,
  document.getElementById(ROOT_ELEMENT)
);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./Root', () => {
    const NextApp = require('./Root').default;
    ReactDOM.render(
      <AppContainer>
        <NextApp store={store} persistor={persistor}/>
      </AppContainer>,
      document.getElementById(ROOT_ELEMENT)
    );
  });
}
