import PropTypes from 'prop-types';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'

import App from './containers/App';

export default function Root ({
  store,
  persistor
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  );
}

Root.propTypes = {
  store: PropTypes.object,
  persistor: PropTypes.object
};
