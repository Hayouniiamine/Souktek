// src/index.js (or main.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // Assuming App.js is in src/
import './index.css'; // Optional: include your global styles

// CORRECTED PATH for CartProvider
import { CartProvider } from './components/context/CartContext.jsx';
import { BrowserRouter as Router } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <CartProvider>
        <App />
      </CartProvider>
    </Router>
  </React.StrictMode>,
);