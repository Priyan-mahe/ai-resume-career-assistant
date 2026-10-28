import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Select HashRouter for static servers (like VS Code Live Server on port 5500)
// and BrowserRouter for Vite dev server (port 5173) and Express server (port 5000)
const isStaticOrLiveServer =
  typeof window !== 'undefined' &&
  (window.location.port === '5500' ||
    window.location.protocol === 'file:' ||
    window.location.pathname.includes('/client/'));

const Router = isStaticOrLiveServer ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
