import { combineReducers } from 'redux';
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import users from './users';

const rootReducer = combineReducers({
    users: users,
});

const persistConfig = {
  key: '@manifesto-root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export default () => {
  let store = createStore(persistedReducer, applyMiddleware(thunk))
  let persistor = persistStore(store)
  return { store, persistor }
}