import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

import appSlice from './appSlice';
import candidateSlice from './candidateSlice';
import interviewSlice from './interviewSlice';
import dashboardSlice from './dashboardSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['candidate', 'interview']
};

const rootReducer = combineReducers({
  app: appSlice,
  candidate: candidateSlice,
  interview: interviewSlice,
  dashboard: dashboardSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);