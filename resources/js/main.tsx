// src/main.tsx (simplifié)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import { Toaster } from 'react-hot-toast'; // Garder le toaster

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{/*...*/}} />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
