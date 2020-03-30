import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage'
import { persistStore, persistReducer } from 'redux-persist'
import rootReducer from '../reducers/root-reducer';

const persistConfig = {
  key: '@easypay-root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
export default function configureStore () {
  let store = createStore(persistedReducer, applyMiddleware(thunk))
  let persistor = persistStore(store)
  return { store, persistor }
}
