// @flow

import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { compact } from 'lodash';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import rootReducer from './reducers';

const middlewares = compact([
  thunk.withExtraArgument()
]);

// ✅ NEW: persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

// ✅ NEW: wrap reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(
  persistedReducer,
  {},
  compose(applyMiddleware(...middlewares))
);

const persistor = persistStore(store);

// exports stay same
export function getPersistor() {
  return persistor;
}

export function getStore() {
  return store;
}