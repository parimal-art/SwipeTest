import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={<div className="min-h-screen flex items-center justify-center">Loading...</div>} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);